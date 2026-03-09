import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../../../../.env") });

import { ensureAwsInitialized } from "../initAwsResources.js";
import { queueService } from "../queue/queue.service.js";
import { jobRegistry } from "../../jobs/jobRegistry.js";
import { requestStore } from "../../../utils/requestContext.js";
import { logger } from "../../../utils/logger.js";

import * as workflowWorker from "./workflowLambda.js";
import * as exportWorker from "./exportLambda.js";
import * as leadReminderWorker from "./leadReminderLambda.js";
import * as analyticsSnapshotWorker from "./analyticsSnapshotLambda.js";
import * as campaignEmailWorker from "./campaignEmailLambda.js";

import { jobService } from "../../services/jobService.js";

let _initialized = false;

async function initialize() {
  if (_initialized) {
    console.log("[JobProcessor] Already initialized, skipping...");
    return;
  }

  console.log("[JobProcessor] Initializing...");

  // Connect to MongoDB
  const uri = process.env.DB_URI || process.env.MONGODB_URI;
  if (!uri)
    throw new Error("[Lambda] No MongoDB URI found. Set DB_URI in .env");

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
    logger.info("[Lambda] Connected to MongoDB");
    console.log("[JobProcessor] MongoDB connected");
  }

  // Initialize AWS resources
  await ensureAwsInitialized();
  console.log("[JobProcessor] AWS resources initialized");

  queueService.bootstrap();
  console.log("[JobProcessor] Queue service bootstrapped");

  // Register workers
  try {
    console.log("[JobProcessor] Registering workers...");
    jobRegistry.register(workflowWorker.jobType, workflowWorker.handler);
    console.log(
      "[JobProcessor] Workflow worker registered:",
      workflowWorker.jobType,
    );

    jobRegistry.register(exportWorker.jobType, exportWorker.handler);
    console.log(
      "[JobProcessor] Export worker registered:",
      exportWorker.jobType,
    );

    jobRegistry.register(
      leadReminderWorker.jobType,
      leadReminderWorker.handler,
    );
    console.log(
      "[JobProcessor] Lead reminder worker registered:",
      leadReminderWorker.jobType,
    );

    jobRegistry.register(
      analyticsSnapshotWorker.jobType,
      analyticsSnapshotWorker.handler,
    );
    console.log(
      "[JobProcessor] Analytics snapshot worker registered:",
      analyticsSnapshotWorker.jobType,
    );

    jobRegistry.register(
      campaignEmailWorker.jobType,
      campaignEmailWorker.handler,
    );
    console.log(
      "[JobProcessor] Campaign email worker registered:",
      campaignEmailWorker.jobType,
    );
    console.log(
      "[JobProcessor] Campaign email worker registered:",
      campaignEmailWorker.jobType,
    );
  } catch (regError) {
    console.error("[JobProcessor] Worker registration failed:", {
      error: regError.message,
      stack: regError.stack,
    });
    throw regError;
  }

  logger.info(
    `[Lambda] Initialized with ${jobRegistry.getAllTypes().length} worker(s)`,
  );
  console.log("[JobProcessor] Initialization complete");

  _initialized = true;
}

export const handler = async (event, _context) => {
  await initialize();

  const records = event.Records || [];

  console.log("[JobProcessor] Lambda handler called with", {
    recordCount: records.length,
    timestamp: new Date().toISOString(),
  });

  if (records.length === 0) {
    logger.info("[Lambda] No records in event, skipping.");
    return { statusCode: 200, body: "No records" };
  }

  logger.info(`[Lambda] Processing ${records.length} record(s)`);

  const batchItemFailures = [];

  for (const record of records) {
    const messageId = record.messageId;

    try {
      const body = JSON.parse(record.body);
      const jobType = body.jobType;

      if (!jobType) {
        logger.warn("[Lambda] Message missing jobType, skipping", {
          messageId,
        });
        continue;
      }

      const workerHandler = jobRegistry.getHandler(jobType);

      const context = {
        tenantId: body.tenantId || body.payload?._meta?.tenantId || null,
        userId: body.payload?._meta?.userId || null,
        requestId: body.payload?._meta?.requestId || messageId,
        traceId: body.payload?._meta?.traceId || null,
      };

      console.log("[JobProcessor] Processing record", {
        jobType,
        messageId,
        tenantId: context.tenantId,
        workerExists: !!workerHandler,
        handlerName: workerHandler?.name || "unknown",
      });

      const jobStoreContext = {
        requestId: context.requestId,
        traceId: context.traceId,
        tenantId: context.tenantId?.toString() ?? null,
        userId: context.userId?.toString() ?? null,
        jobType,
      };

      logger.info(`[Lambda] Executing job`, {
        jobType,
        messageId,
        tenantId: context.tenantId,
      });

      const result = await new Promise((resolve, reject) => {
        requestStore.run(jobStoreContext, () => {
          console.log("[JobProcessor] Executing worker handler for:", jobType);
          workerHandler(body.payload || body, context)
            .then((res) => {
              console.log("[JobProcessor] Worker handler resolved");
              resolve(res);
            })
            .catch((err) => {
              console.error("[JobProcessor] Worker handler rejected:", {
                jobType,
                error: err.message,
                stack: err.stack,
              });
              reject(err);
            });
        });
      });

      const jobId = body.payload?._meta?.jobId || null;
      const jobTenantId = context.tenantId;

      if (result.success) {
        logger.info(`[Lambda] Job completed`, { jobType, messageId });
        console.log("[JobProcessor] Job succeeded", { jobType, messageId });

        if (jobId && jobTenantId) {
          await jobService
            .updateJob(jobId, jobTenantId, {
              status: "completed",
              progress: 100,
              result: { message: result.message },
            })
            .catch((e) =>
              console.warn(
                "[JobProcessor] Failed to update job status:",
                e.message,
              ),
            );
        }
      } else if (result.shouldRetry) {
        logger.warn(`[Lambda] Job needs retry`, { jobType, messageId });
        console.log("[JobProcessor] Job needs retry", {
          jobType,
          messageId,
        });

        if (jobId && jobTenantId) {
          await jobService
            .updateJob(jobId, jobTenantId, {
              status: "retrying",
              result: { message: result.message },
            })
            .catch((e) =>
              console.warn(
                "[JobProcessor] Failed to update job status:",
                e.message,
              ),
            );
        }

        batchItemFailures.push({ itemIdentifier: messageId });
      } else {
        logger.error(`[Lambda] Job failed (no retry)`, { jobType, messageId });
        console.log("[JobProcessor] Job failed (no retry)", {
          jobType,
          messageId,
        });

        if (jobId && jobTenantId) {
          await jobService
            .updateJob(jobId, jobTenantId, {
              status: "failed",
              error: { message: result.message },
            })
            .catch((e) =>
              console.warn(
                "[JobProcessor] Failed to update job status:",
                e.message,
              ),
            );
        }
      }
    } catch (error) {
      logger.error(`[Lambda] Failed to process message`, {
        messageId,
        error: error.message,
        stack: error.stack,
      });
      console.error("[JobProcessor] Error processing message", {
        messageId,
        error: error.message,
        errorStack: error.stack,
      });

      const failedJobId = (() => {
        try {
          return JSON.parse(record.body)?.payload?._meta?.jobId || null;
        } catch {
          return null;
        }
      })();
      const failedTenantId = (() => {
        try {
          return JSON.parse(record.body)?.tenantId || null;
        } catch {
          return null;
        }
      })();

      if (failedJobId && failedTenantId) {
        await jobService
          .updateJob(failedJobId, failedTenantId, {
            status: "failed",
            error: { message: error.message },
          })
          .catch(() => {});
      }

      batchItemFailures.push({ itemIdentifier: messageId });
    }
  }

  return { batchItemFailures };
};
