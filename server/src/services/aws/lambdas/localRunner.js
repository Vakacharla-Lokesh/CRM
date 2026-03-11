import mongoose from "mongoose";

import { ensureAwsInitialized } from "../initAwsResources.js";
import { handler } from "./jobProcessorLambda.js";
import envConfig from "../../../config/envConfig.js";

const BATCH_SIZE = 10;

const controller = new AbortController();
const { signal } = controller;

async function connectDatabase() {
  const uri = envConfig.dbUri;
  if (!uri)
    throw new Error("[LocalRunner] No MongoDB URI found. Set DB_URI in .env");

  await mongoose.connect(uri);
  console.log("[LocalRunner] Connected to MongoDB");
}

async function shutdown() {
  console.log("\n[LocalRunner]  Shutting down...");
  controller.abort();

  try {
    await mongoose.connection.close();
    console.log("[LocalRunner] MongoDB connection closed");
  } catch (error) {
    console.error("[LocalRunner] Error closing MongoDB:", error);
  }

  process.exit(0);
}

async function pollQueueLegacy(queueService, queueName) {
  try {
    console.log(
      `[LocalRunner] Legacy polling (development only): ${queueName}`,
    );
    const messages = await queueService.poll(queueName, BATCH_SIZE);

    if (messages.length === 0) {
      console.log(`[LocalRunner] No messages in ${queueName}`);
      return;
    }

    console.log(
      `[LocalRunner] Received ${messages.length} message(s) from "${queueName}"`,
    );

    const sqsEvent = {
      Records: messages.map((msg) => ({
        messageId: msg.messageId,
        receiptHandle: msg.receiptHandle,
        body: JSON.stringify(msg.body),
        attributes: msg.attributes || {},
      })),
    };

    let result;
    try {
      result = await handler(sqsEvent, {});
    } catch (handlerError) {
      console.error("[LocalRunner] Handler threw error:", handlerError.message);
      throw handlerError;
    }

    console.log("[LocalRunner] Handler completed", {
      processed: messages.length - (result.batchItemFailures || []).length,
      failed: (result.batchItemFailures || []).length,
    });

    const failedIds = new Set(
      (result.batchItemFailures || []).map((f) => f.itemIdentifier),
    );

    for (const msg of messages) {
      if (!failedIds.has(msg.messageId)) {
        await queueService.ack(queueName, msg.receiptHandle);
        console.log("[LocalRunner] ACK'd message:", msg.messageId);
      } else {
        console.log("[LocalRunner] Message failed, not ACK'd:", msg.messageId);
      }
    }
  } catch (error) {
    console.error(`[LocalRunner] Error polling "${queueName}":`, error);
  }
}

async function main() {
  console.log(
    "[LocalRunner] Starting local runner (development/testing mode)...",
  );

  try {
    await connectDatabase();
    console.log("[LocalRunner] Database connected");

    await ensureAwsInitialized();
    console.log("[LocalRunner] AWS resources initialized");

    // Setup EventBridge as the primary mechanism
    const { queueService } = await import("../queue/queueService.js");
    queueService.bootstrap();
    console.log("[LocalRunner] Queue service bootstrapped");

    console.log(
      "[LocalRunner] EventBridge is configured for production job processing",
    );
    console.log(
      "[LocalRunner] This local runner uses legacy polling for development only\n",
    );
  } catch (error) {
    console.error("[LocalRunner] Bootstrap failed:", error);
    process.exit(1);
  }

  const { queueService } = await import("../queue/queueSqervice.js");
  const QUEUE_NAMES = ["offlineWrites", "exportData"];
  const POLL_INTERVAL_MS = 5000;

  while (!signal.aborted) {
    for (const queueName of QUEUE_NAMES) {
      if (signal.aborted) break;
      try {
        await pollQueueLegacy(queueService, queueName);
      } catch (err) {
        console.error(`[LocalRunner] Error in polling ${queueName}:`, err);
      }
    }

    if (!signal.aborted) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
  }

  console.log("[LocalRunner] Stopped.");
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

process.on("uncaughtException", (error) => {
  console.error("[LocalRunner] Uncaught exception:", error);
  shutdown();
});

process.on("unhandledRejection", (reason) => {
  console.error("[LocalRunner] Unhandled rejection:", reason);
  shutdown();
});

main().catch((error) => {
  console.error("[LocalRunner] Fatal error:", error);
  process.exit(1);
});
