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

let _initialized = false;

async function initialize() {
  if (_initialized) return;

  // Connect to MongoDB
  const uri = process.env.DB_URI || process.env.MONGODB_URI;
  if (!uri)
    throw new Error("[Lambda] No MongoDB URI found. Set DB_URI in .env");

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
    logger.info("[Lambda] Connected to MongoDB");
  }

  // Initialize AWS resources
  await ensureAwsInitialized();
  queueService.bootstrap();

  // Register workers
  jobRegistry.register(workflowWorker.jobType, workflowWorker.handler);
  jobRegistry.register(exportWorker.jobType, exportWorker.handler);
  jobRegistry.register(leadReminderWorker.jobType, leadReminderWorker.handler);

  logger.info(
    `[Lambda] Initialized with ${jobRegistry.getAllTypes().length} worker(s)`,
  );

  _initialized = true;
}

export const handler = async (event, _context) => {
  await initialize();

  const records = event.Records || [];

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
          workerHandler(body.payload || body, context)
            .then(resolve)
            .catch(reject);
        });
      });

      if (result.success) {
        logger.info(`[Lambda] Job completed`, {
          jobType,
          messageId,
          message: result.message,
        });
      } else if (result.shouldRetry) {
        logger.warn(`[Lambda] Job needs retry`, {
          jobType,
          messageId,
          message: result.message,
        });
        batchItemFailures.push({ itemIdentifier: messageId });
      } else {
        logger.error(`[Lambda] Job failed (no retry)`, {
          jobType,
          messageId,
          message: result.message,
        });
      }
    } catch (error) {
      logger.error(`[Lambda] Failed to process message`, {
        messageId,
        error: error.message,
        stack: error.stack,
      });
      batchItemFailures.push({ itemIdentifier: messageId });
    }
  }

  return { batchItemFailures };
};
