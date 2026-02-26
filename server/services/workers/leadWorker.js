import { queueManager } from "../queue/queueManager.js";
import { workflowExecutionEngine } from "../workflowExecutionService.js";
import workflowExecutionLogModel from "../../models/workflows/workflowExecutionLogModel.js";

const QUEUE_NAME = "offlineWrites";
const BATCH_SIZE = 10;
const POLL_INTERVAL_MS = 5000;

// ─── Message Handler ──────────────────────────────────────────────────────────

async function processMessage(message) {
  const { messageId, receiptHandle, body } = message;
  console.log(`[LeadWorker] Processing message: ${messageId}`);

  try {
    const result = await workflowExecutionEngine.executeWorkflow(body);

    if (result.success) {
      await queueManager.ack(QUEUE_NAME, receiptHandle);
      console.log(`[LeadWorker] ✓ Message deleted: ${messageId}`);
    } else if (result.shouldRetry) {
      const retryMessage = { ...body, retryCount: (body.retryCount || 0) + 1 };
      await queueManager.enqueue(QUEUE_NAME, retryMessage);
      await queueManager.ack(QUEUE_NAME, receiptHandle);
      console.log(
        `[LeadWorker] ↻ Requeued for retry (${retryMessage.retryCount}/${body.maxRetries}): ${messageId}`,
      );
    } else {
      await queueManager.ack(QUEUE_NAME, receiptHandle);
      console.log(
        `[LeadWorker] ✗ Max retries reached, message dropped: ${messageId}`,
      );
    }
  } catch (error) {
    console.error(
      `[LeadWorker] ✗ Failed to process message: ${messageId}`,
      error,
    );

    const retryMessage = { ...body, retryCount: (body.retryCount || 0) + 1 };

    if (retryMessage.retryCount < body.maxRetries) {
      try {
        await queueManager.enqueue(QUEUE_NAME, retryMessage);
        await queueManager.ack(QUEUE_NAME, receiptHandle);
        console.log(
          `[LeadWorker] ↻ Requeued after error (${retryMessage.retryCount}/${body.maxRetries}): ${messageId}`,
        );
      } catch (requeueError) {
        console.error("[LeadWorker] Failed to requeue message:", requeueError);
      }
    } else {
      try {
        await queueManager.ack(QUEUE_NAME, receiptHandle);
      } catch (deleteError) {
        console.error(
          "[LeadWorker] Failed to delete failed message:",
          deleteError,
        );
      }
    }
  }
}

// ─── Stats ────────────────────────────────────────────────────────────────────

async function getStats() {
  try {
    const queueStats = await queueManager.stats(QUEUE_NAME);

    const executionStats = await workflowExecutionLogModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    return {
      queue: queueStats,
      executions: Object.fromEntries(
        executionStats.map((s) => [s._id, s.count]),
      ),
    };
  } catch (error) {
    console.error("[LeadWorker] Failed to get stats:", error);
    return null;
  }
}

// ─── Poll Loop ────────────────────────────────────────────────────────────────

async function start(signal) {
  console.log("[LeadWorker] 🚀 Starting...");

  while (!signal.aborted) {
    try {
      const messages = await queueManager.poll(QUEUE_NAME, BATCH_SIZE);

      if (messages.length === 0) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        continue;
      }

      console.log(`[LeadWorker] 📨 Received ${messages.length} message(s)`);

      for (const message of messages) {
        if (signal.aborted) break;
        await processMessage(message);
      }
    } catch (error) {
      console.error("[LeadWorker] Polling error:", error);
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
  }

  console.log("[LeadWorker] ⏸ Stopped.");
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const leadWorker = {
  start,
  getStats,
  QUEUE_NAME,
};

export default leadWorker;
