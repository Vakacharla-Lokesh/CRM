import mongoose from "mongoose";
import { queueManager } from "../services/queueManager.js";
import { workflowExecutionEngine } from "../services/workflowExecutionService.js";
import workflowExecutionLogModel from "../models/workflows/workflowExecutionLogModel.js";
import { initAwsResources } from "../config/initAws.js";
import { config } from "dotenv";

config();

// ============================================================================
// WORKER CLASS
// ============================================================================

class WorkflowWorker {
  constructor() {
    this.isRunning = false;
    this.processingTimeout = 5000; // 5 seconds between polls
    this.batchSize = 10; // Process up to 10 messages at a time
  }

  /**
   * Start worker process
   */
  async start() {
    console.log("🚀 Workflow Worker starting...");

    try {
      // Connect to MongoDB
      await this.connectDatabase();

      // Initialize AWS resources (creates SQS queue if not exists)
      await initAwsResources();

      // Initialize queue
      await queueManager.initialize();

      this.isRunning = true;
      console.log("✓ Worker initialized and ready");

      // Start polling loop
      await this.poll();
    } catch (error) {
      console.error("✗ Worker startup failed:", error);
      process.exit(1);
    }
  }

  /**
   * Connect to MongoDB
   */
  async connectDatabase() {
    try {
      await mongoose.connect(
        process.env.MONGODB_URI || "mongodb://localhost:27017/campaign-flux",
      );
      console.log("✓ Connected to MongoDB");
    } catch (error) {
      console.error("✗ MongoDB connection failed:", error);
      throw error;
    }
  }

  /**
   * Main polling loop
   * Continuously checks for messages in queue
   */
  async poll() {
    while (this.isRunning) {
      try {
        // Receive messages from queue
        const messages = await queueManager.receiveMessages(this.batchSize);

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

  /**
   * Process a single message
   */
  async processMessage(message) {
    const { messageId, receiptHandle, body } = message;

    console.log(`\n🔄 Processing message: ${messageId}`);

    try {
      // Execute the workflow
      const result = await workflowExecutionEngine.executeWorkflow(body);

      if (result.success) {
        // Delete message from queue on success
        await queueManager.deleteMessage(receiptHandle);
        console.log(`✓ Message deleted from queue: ${messageId}`);
      } else if (result.shouldRetry) {
        // Re-queue message with incremented retry count
        const retryMessage = {
          ...body,
          retryCount: (body.retryCount || 0) + 1,
        };

        const newMessageId = await queueManager.sendMessage(retryMessage);
        await queueManager.deleteMessage(receiptHandle);

        console.log(
          `↻ Message requeued for retry (${retryMessage.retryCount}/${body.maxRetries}): ${newMessageId}`,
        );
      } else {
        // Delete message after max retries
        await queueManager.deleteMessage(receiptHandle);
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
          const newMessageId = await queueManager.sendMessage(retryMessage);
          await queueManager.deleteMessage(receiptHandle);
          console.log(
            `↻ Message requeued after error (${retryMessage.retryCount}/${body.maxRetries}): ${newMessageId}`,
          );
        } catch (requeueError) {
          console.error(`✗ Failed to requeue message:`, requeueError);
          // Leave message in queue (it will be retried by visibility timeout)
        }
      } else {
        // Mark as failed and delete
        try {
          await queueManager.deleteMessage(receiptHandle);
        } catch (deleteError) {
          console.error(`✗ Failed to delete failed message:`, deleteError);
        }
      }
    }
  }

  /**
   * Graceful shutdown
   */
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

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get worker statistics
   */
  async getStats() {
    try {
      const queueStats = await queueManager.getQueueStats();

      const executionStats = await workflowExecutionLogModel.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      return {
        queue: queueStats,
        executions: Object.fromEntries(
          executionStats.map((s) => [s._id, s.count]),
        ),
      };
    } catch (error) {
      console.error("Failed to get stats:", error);
      return null;
    }
  }
}

// ============================================================================
// STARTUP & SIGNAL HANDLING
// ============================================================================

const worker = new WorkflowWorker();

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
    const stats = await worker.getStats();
    if (stats) {
      console.log("\n📊 Worker Stats:");
      console.log(`  Queue: ${stats.queue?.approximateMessages || 0} messages`);
      console.log(`  Processing: ${stats.queue?.processingMessages || 0}`);
      console.log(`  Executions: ${JSON.stringify(stats.executions)}`);
    }
  }
}, 60000); // Every minute

/**
 * RUNNING THE WORKER:
 *
 * In development:
 * node server/worker.js
 *
 * With nodemon (auto-restart):
 * nodemon server/worker.js
 *
 * With environment variables:
 * MONGODB_URI=mongodb://localhost:27017/db \
 * LOCALSTACK_ENDPOINT=http://localhost:4566 \
 * node server/worker.js
 *
 * In production (with PM2):
 * pm2 start server/worker.js --name "workflow-worker" --instances 2
 */
