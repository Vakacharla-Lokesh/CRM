// ─── Local Development Runner ─────────────────────────────────────────────────
//
// Simulates what AWS does in production: polls SQS queues and invokes
// the Lambda handler with SQS-formatted events. For local dev only.

import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../../../.env") });

import { ensureAwsInitialized } from "../../services/aws/initAwsResources.js";
import { queueService } from "../queue/queue.service.js";
import { handler } from "./jobProcessor.lambda.js";

const POLL_INTERVAL_MS = 5000;
const BATCH_SIZE = 10;
const QUEUE_NAMES = ["offlineWrites", "exportData"];

// ─── Process-level abort controller ───────────────────────────────────────────

const controller = new AbortController();
const { signal } = controller;

// ─── Database ─────────────────────────────────────────────────────────────────

async function connectDatabase() {
  const uri = process.env.DB_URI || process.env.MONGODB_URI;
  if (!uri)
    throw new Error("[LocalRunner] No MongoDB URI found. Set DB_URI in .env");

  await mongoose.connect(uri);
  console.log("[LocalRunner] ✓ Connected to MongoDB");
}

// ─── Shutdown ─────────────────────────────────────────────────────────────────

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

// ─── Poll and Process ─────────────────────────────────────────────────────────

async function pollQueue(queueName) {
  try {
    const messages = await queueService.poll(queueName, BATCH_SIZE);

    if (messages.length === 0) return;

    console.log(
      `[LocalRunner] 📨 Received ${messages.length} message(s) from "${queueName}"`,
    );

    // Transform to SQS Lambda event format
    const sqsEvent = {
      Records: messages.map((msg) => ({
        messageId: msg.messageId,
        receiptHandle: msg.receiptHandle,
        body: JSON.stringify(msg.body),
        attributes: msg.attributes || {},
      })),
    };

    // Invoke the Lambda handler
    const result = await handler(sqsEvent, {});

    // Ack successful messages (those NOT in batchItemFailures)
    const failedIds = new Set(
      (result.batchItemFailures || []).map((f) => f.itemIdentifier),
    );

    for (const msg of messages) {
      if (!failedIds.has(msg.messageId)) {
        await queueService.ack(queueName, msg.receiptHandle);
      }
    }
  } catch (error) {
    console.error(`[LocalRunner] Error polling "${queueName}":`, error);
  }
}

// ─── Main Loop ────────────────────────────────────────────────────────────────

async function main() {
  console.log("[LocalRunner] 🚀 Starting local worker runner...");

  try {
    await connectDatabase();
    await ensureAwsInitialized();
    queueService.bootstrap();

    console.log(
      `[LocalRunner] ✓ Ready. Polling ${QUEUE_NAMES.length} queue(s): ${QUEUE_NAMES.join(", ")}\n`,
    );
  } catch (error) {
    console.error("[LocalRunner] ✗ Bootstrap failed:", error);
    process.exit(1);
  }

  while (!signal.aborted) {
    for (const queueName of QUEUE_NAMES) {
      if (signal.aborted) break;
      await pollQueue(queueName);
    }

    if (!signal.aborted) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
  }

  console.log("[LocalRunner] ⏸ Stopped.");
}

// ─── Process Signal Handlers ──────────────────────────────────────────────────

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

// ─── Start ────────────────────────────────────────────────────────────────────

main().catch((error) => {
  console.error("[LocalRunner] ✗ Fatal error:", error);
  process.exit(1);
});
