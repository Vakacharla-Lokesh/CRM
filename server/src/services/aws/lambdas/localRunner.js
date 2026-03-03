import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../../../../.env") });

import { ensureAwsInitialized } from "../initAwsResources.js";
import { queueService } from "../queue/queue.service.js";
import { handler } from "./jobProcessorLambda.js";

const POLL_INTERVAL_MS = 5000;
const BATCH_SIZE = 10;
const QUEUE_NAMES = ["offlineWrites", "exportData"];

const controller = new AbortController();
const { signal } = controller;

async function connectDatabase() {
  const uri = process.env.DB_URI || process.env.MONGODB_URI;
  if (!uri)
    throw new Error("[LocalRunner] No MongoDB URI found. Set DB_URI in .env");

  await mongoose.connect(uri);
  console.log("[LocalRunner] ✓ Connected to MongoDB");
}
async function shutdown() {
  console.log("\n[LocalRunner] ⏸  Shutting down...");
  controller.abort();

  try {
    await mongoose.connection.close();
    console.log("[LocalRunner] ✓ MongoDB connection closed");
  } catch (error) {
    console.error("[LocalRunner] Error closing MongoDB:", error);
  }

  process.exit(0);
}

async function pollQueue(queueName) {
  try {
    console.log(`[LocalRunner] 🔍 Polling start for queue: ${queueName}`);
    const messages = await queueService.poll(queueName, BATCH_SIZE);

    console.log(`[LocalRunner] 📊 Poll result for ${queueName}:`, {
      messageCount: messages.length,
      timestamp: new Date().toISOString(),
    });

    if (messages.length === 0) {
      console.log(`[LocalRunner] ⏭ No messages in ${queueName}, skipping...`);
      return;
    }

    console.log(
      `[LocalRunner] 📨 Received ${messages.length} message(s) from "${queueName}" at ${new Date().toISOString()}`,
    );

    const sqsEvent = {
      Records: messages.map((msg) => ({
        messageId: msg.messageId,
        receiptHandle: msg.receiptHandle,
        body: JSON.stringify(msg.body),
        attributes: msg.attributes || {},
      })),
    };

    console.log("[LocalRunner] 🔄 Invoking handler for messages", {
      queueName,
      messageCount: messages.length,
      jobTypes: messages.map((m) => m.body?.jobType),
    });

    let result;
    try {
      result = await handler(sqsEvent, {});
    } catch (handlerError) {
      console.error("[LocalRunner] ❌ Handler threw error:", {
        queueName,
        error: handlerError.message,
        stack: handlerError.stack,
      });
      throw handlerError;
    }

    console.log("[LocalRunner] ✓ Handler completed", {
      queueName,
      processed: messages.length - (result.batchItemFailures || []).length,
      failed: (result.batchItemFailures || []).length,
    });

    const failedIds = new Set(
      (result.batchItemFailures || []).map((f) => f.itemIdentifier),
    );

    for (const msg of messages) {
      if (!failedIds.has(msg.messageId)) {
        await queueService.ack(queueName, msg.receiptHandle);
        console.log("[LocalRunner] ✓ ACK'd message:", msg.messageId);
      } else {
        console.log("[LocalRunner] ⚠ Message failed, not ACK'd:", msg.messageId);
      }
    }
  } catch (error) {
    console.error(`[LocalRunner] ❌ Error polling "${queueName}":`, {
      error: error.message,
      stack: error.stack,
    });
  }
}

async function main() {
  console.log("[LocalRunner] 🚀 Starting local worker runner...");

  try {
    await connectDatabase();
    console.log("[LocalRunner] ✓ Database connected");
    
    await ensureAwsInitialized();
    console.log("[LocalRunner] ✓ AWS initialized");
    
    queueService.bootstrap();
    console.log("[LocalRunner] ✓ Queue service bootstrapped");

    console.log(
      `[LocalRunner] ✓ Ready. Polling ${QUEUE_NAMES.length} queue(s): ${QUEUE_NAMES.join(", ")}\n`,
    );
  } catch (error) {
    console.error("[LocalRunner] ✗ Bootstrap failed:", error);
    process.exit(1);
  }

  while (!signal.aborted) {
    console.log("[LocalRunner] 🔄 Poll cycle starting...", {
      timestamp: new Date().toISOString(),
    });
    
    for (const queueName of QUEUE_NAMES) {
      if (signal.aborted) break;
      console.log(`[LocalRunner] 📌 Polling queue: ${queueName}`);
      try {
        await pollQueue(queueName);
      } catch (err) {
        console.error(`[LocalRunner] ❌ Error in pollQueue for ${queueName}:`, err);
      }
    }

    if (!signal.aborted) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
  }

  console.log("[LocalRunner] ⏸ Stopped.");
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

process.on("uncaughtException", (error) => {
  console.error("[LocalRunner] ✗ Uncaught exception:", error);
  shutdown();
});

process.on("unhandledRejection", (reason) => {
  console.error("[LocalRunner] ✗ Unhandled rejection:", reason);
  shutdown();
});

main().catch((error) => {
  console.error("[LocalRunner] ✗ Fatal error:", error);
  process.exit(1);
});
