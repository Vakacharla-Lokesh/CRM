import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../../../../.env") });

import { ensureAwsInitialized } from "../initAwsResources.js";
import { queueService } from "../queue/queue.service.js";
import { jobRegistry } from "../../../modules/jobs/jobRegistry.js";


import * as workflowWorker from "../../../workers/workflow.worker.js";
import * as exportWorker from "../../../workers/export.worker.js";
import * as leadReminderWorker from "../../../workers/leadReminder.worker.js";


let _initialized = false;

async function initialize() {
  if (_initialized) return;

  // Connect to MongoDB
  const uri = process.env.DB_URI || process.env.MONGODB_URI;
  if (!uri)
    throw new Error("[Lambda] No MongoDB URI found. Set DB_URI in .env");

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
    console.log("[Lambda] ✓ Connected to MongoDB");
  }

  // Initialize AWS resources
  await ensureAwsInitialized();
  queueService.bootstrap();

  // Register workers
  jobRegistry.register(workflowWorker.jobType, workflowWorker.handler);
  jobRegistry.register(exportWorker.jobType, exportWorker.handler);
  jobRegistry.register(leadReminderWorker.jobType, leadReminderWorker.handler);

  console.log(
    `[Lambda] ✓ Initialized with ${jobRegistry.getAllTypes().length} worker(s)`,
  );

  _initialized = true;
}


export const handler = async (event, _context) => {
  await initialize();

  const records = event.Records || [];

  if (records.length === 0) {
    console.log("[Lambda] No records in event, skipping.");
    return { statusCode: 200, body: "No records" };
  }

  console.log(`[Lambda] Processing ${records.length} record(s)`);

  const batchItemFailures = [];

  for (const record of records) {
    const messageId = record.messageId;

    try {
      const body = JSON.parse(record.body);
      const jobType = body.jobType;

      if (!jobType) {
        console.error(
          `[Lambda] Message ${messageId} missing jobType, skipping`,
        );
        continue;
      }

      const workerHandler = jobRegistry.getHandler(jobType);

      // Build execution context
      const context = {
        tenantId: body.tenantId || body.payload?._meta?.tenantId || null,
        userId: body.payload?._meta?.userId || null,
        requestId: body.payload?._meta?.requestId || messageId,
        traceId: body.payload?._meta?.traceId || null,
      };

      console.log(
        `[Lambda] Executing ${jobType} (message: ${messageId}, tenant: ${context.tenantId})`,
      );

      const result = await workerHandler(body.payload || body, context);

      if (result.success) {
        console.log(`[Lambda] ✓ ${jobType} completed: ${result.message}`);
      } else if (result.shouldRetry) {
        console.warn(`[Lambda] ↻ ${jobType} needs retry: ${result.message}`);
        batchItemFailures.push({ itemIdentifier: messageId });
      } else {
        console.error(
          `[Lambda] ✗ ${jobType} failed (no retry): ${result.message}`,
        );
      }
    } catch (error) {
      console.error(
        `[Lambda] ✗ Failed to process message ${messageId}:`,
        error,
      );
      batchItemFailures.push({ itemIdentifier: messageId });
    }
  }

  // Return partial batch failure response for SQS
  return { batchItemFailures };
};
