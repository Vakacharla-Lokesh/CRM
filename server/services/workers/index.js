import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import mongoose from "mongoose";

import { ensureAwsInitialized } from "../aws/initAwsResources.js";
import { queueManager } from "../queue/queueManager.js";
import { leadWorker } from "./leadWorker.js";
import { exportWorker } from "./exportWorker.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../../.env") });

// ─── Process-level abort controller (used for graceful shutdown) ──────────────

const controller = new AbortController();
const { signal } = controller;

// ─── Database ─────────────────────────────────────────────────────────────────

async function connectDatabase() {
  const uri = process.env.DB_URI || process.env.MONGODB_URI;
  if (!uri)
    throw new Error("[Workers] No MongoDB URI found. Set DB_URI in .env");

  await mongoose.connect(uri);
  console.log("[Workers] ✓ Connected to MongoDB");
}

// ─── Shutdown ─────────────────────────────────────────────────────────────────

async function shutdown() {
  console.log("\n[Workers] ⏸  Shutting down all workers...");
  controller.abort();

  try {
    await mongoose.connection.close();
    console.log("[Workers] ✓ MongoDB connection closed");
  } catch (error) {
    console.error("[Workers] Error closing MongoDB:", error);
  }

  process.exit(0);
}

// ─── Periodic Stats ───────────────────────────────────────────────────────────

function startStatsReporter() {
  setInterval(async () => {
    if (signal.aborted) return;

    try {
      const stats = await leadWorker.getStats();
      if (stats) {
        console.log("\n[Workers] 📊 Stats:");
        console.log(`  Queue depth: ${stats.queue?.approximateMessages ?? 0}`);
        console.log(`  In-flight:   ${stats.queue?.processingMessages ?? 0}`);
        console.log(`  Executions:  ${JSON.stringify(stats.executions)}`);
      }
    } catch (err) {
      console.error("[Workers] Stats reporter error:", err);
    }
  }, 60_000);
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

async function main() {
  console.log("[Workers] 🚀 Bootstrapping all workers...");

  try {
    await connectDatabase();
    await ensureAwsInitialized();

    // Register all known queues into the queue manager
    queueManager.bootstrap();

    console.log("[Workers] ✓ Bootstrap complete. Starting workers...\n");
  } catch (error) {
    console.error("[Workers] ✗ Bootstrap failed:", error);
    process.exit(1);
  }

  // Start all workers concurrently — each runs its own poll loop
  startStatsReporter();

  await Promise.all([leadWorker.start(signal), exportWorker.start(signal)]);
}

// ─── Process Signal Handlers ──────────────────────────────────────────────────

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

process.on("uncaughtException", (error) => {
  console.error("[Workers] ✗ Uncaught exception:", error);
  shutdown();
});

process.on("unhandledRejection", (reason) => {
  console.error("[Workers] ✗ Unhandled rejection:", reason);
  shutdown();
});

// ─── Start ────────────────────────────────────────────────────────────────────

main().catch((error) => {
  console.error("[Workers] ✗ Fatal error:", error);
  process.exit(1);
});
