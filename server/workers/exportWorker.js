import mongoose from "mongoose";
import { QueueManager } from "../services/queueManager.js";
import { EXPORT_QUEUE_URL, initAwsResources } from "../config/initAws.js";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import exportCsvEngine from "../services/exportToCsvService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../.env") });

class ExportWorker {
  constructor() {
    this.isRunning = false;
    this.processingTimeout = 5000;
    this.batchSize = 10;
    this.queueUrl = null;
    this.queueManager = new QueueManager(null);
  }

  async start() {
    console.log("🚀 Export Worker starting...");

    try {
      // Connect to MongoDB
      await this.connectDatabase();

      // Initialize AWS resources (creates SQS queue if not exists)
      await initAwsResources();

      await this.queueManager.initialize(EXPORT_QUEUE_URL);
      this.queueUrl = this.queueManager.queueUrl;
      console.log(`✓ Export Worker targeting queue: ${this.queueUrl}`);

      this.isRunning = true;
      console.log("✓ Worker initialized and ready");

      // Start polling loop
      await this.poll();
    } catch (error) {
      console.error("✗ Worker startup failed:", error);
      process.exit(1);
    }
  }

  async connectDatabase() {
    try {
      const uri = process.env.DB_URI || process.env.MONGODB_URI;
      if (!uri) {
        throw new Error(
          "No MongoDB URI found. Set DB_URI (or MONGODB_URI) in .env",
        );
      }
      await mongoose.connect(uri);
      console.log("✓ Connected to MongoDB");
    } catch (error) {
      console.error("✗ MongoDB connection failed:", error);
      throw error;
    }
  }

  async poll() {
    while (this.isRunning) {
      try {
        // Receive messages from queue
        const messages = await this.queueManager.receiveMessages(
          this.batchSize,
          this.queueUrl,
        );

        if (messages.length === 0) {
          // Queue is empty, wait before next poll
          await this.sleep(this.processingTimeout);
          continue;
        }

        console.log(`\n📨 Received ${messages.length} message(s) from queue`);

        // Process each message
        for (const message of messages) {
          await this.processMessage(message);
        }
      } catch (error) {
        console.error("✗ Polling error:", error);
        // Wait before retrying to avoid spam on connection errors
        await this.sleep(this.processingTimeout);
      }
    }
  }

  async processMessage(message) {
    const { messageId, receiptHandle, body } = message;

    console.log(`\n🔄 Processing message: ${messageId}`);
    console.log(`📦 Entity Type: ${body.entity.type}`);

    console.log("testing body data: ", body);

    try {
      let result;

      // Process based on entity type
      switch (body.entity.type) {
        case "leads":
          result = await exportCsvEngine.exportLeads(body);
          break;
        case "deals":
          result = await exportCsvEngine.exportDeals(body);
          break;
        case "organizations":
          result = await exportCsvEngine.exportOrganizations(body);
          break;
        default:
          throw new Error(`Unknown entity type: ${body.entityType}`);
      }

      if (result.success) {
        // Delete message from queue on success
        await this.queueManager.deleteMessage(receiptHandle, this.queueUrl);
        console.log(`✓ Message deleted from queue: ${messageId}`);
      } else if (result.shouldRetry) {
        // Re-queue message with incremented retry count
        const retryMessage = {
          ...body,
          retryCount: (body.retryCount || 0) + 1,
        };

        const newMessageId = await this.queueManager.sendMessage(
          retryMessage,
          this.queueUrl,
        );
        await this.queueManager.deleteMessage(receiptHandle, this.queueUrl);

        console.log(
          `↻ Message requeued for retry (${retryMessage.retryCount}/${body.maxRetries}): ${newMessageId}`,
        );
      } else {
        // Delete message after max retries
        await this.queueManager.deleteMessage(receiptHandle, this.queueUrl);
        console.log(`✗ Message deleted after max retries: ${messageId}`);
      }
    } catch (error) {
      console.error(`✗ Failed to process message: ${messageId}`, error);

      // Increment retry count and requeue
      const retryMessage = {
        ...body,
        retryCount: (body.retryCount || 0) + 1,
      };

      if (retryMessage.retryCount < body.maxRetries) {
        try {
          const newMessageId = await this.queueManager.sendMessage(
            retryMessage,
            this.queueUrl,
          );
          await this.queueManager.deleteMessage(receiptHandle, this.queueUrl);
          console.log(
            `↻ Message requeued after error (${retryMessage.retryCount}/${body.maxRetries}): ${newMessageId}`,
          );
        } catch (requeueError) {
          console.error(`✗ Failed to requeue message:`, requeueError);
        }
      } else {
        try {
          await this.queueManager.deleteMessage(receiptHandle, this.queueUrl);
        } catch (deleteError) {
          console.error(`✗ Failed to delete failed message:`, deleteError);
        }
      }
    }
  }

  async shutdown() {
    console.log("\n⏸  Shutting down worker...");
    this.isRunning = false;

    try {
      await mongoose.connection.close();
      console.log("✓ MongoDB connection closed");
    } catch (error) {
      console.error("✗ Error closing MongoDB:", error);
    }

    process.exit(0);
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

const worker = new ExportWorker();

// Handle shutdown signals
process.on("SIGTERM", () => worker.shutdown());
process.on("SIGINT", () => worker.shutdown());

// Log uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("✗ Uncaught exception:", error);
  worker.shutdown();
});

// Start worker
worker.start().catch((error) => {
  console.error("✗ Worker failed to start:", error);
  process.exit(1);
});

// Log stats periodically
setInterval(async () => {
  if (worker.isRunning) {
    console.log("working on task: ...");
  }
}, 60000); // Every minute
