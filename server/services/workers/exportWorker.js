import { queueManager } from "../queue/queueManager.js";
import exportCsvEngine from "../exportToCsvService.js";

const QUEUE_NAME = "exportData";
const BATCH_SIZE = 10;
const POLL_INTERVAL_MS = 5000;

// ─── Message Handler ──────────────────────────────────────────────────────────

async function processMessage(message) {
  const { messageId, receiptHandle, body } = message;
  console.log(`[ExportWorker] 🔄 Processing message: ${messageId}`);
  console.log(`[ExportWorker] 📦 Entity type: ${body.entity?.type}`);

  try {
    let result;

    switch (body.entity?.type) {
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
        throw new Error(
          `[ExportWorker] Unknown entity type: ${body.entity?.type}`,
        );
    }

    if (result.success) {
      await queueManager.ack(QUEUE_NAME, receiptHandle);
      console.log(`[ExportWorker] ✓ Message deleted: ${messageId}`);
    } else if (result.shouldRetry) {
      const retryMessage = { ...body, retryCount: (body.retryCount || 0) + 1 };
      await queueManager.enqueue(QUEUE_NAME, retryMessage);
      await queueManager.ack(QUEUE_NAME, receiptHandle);
      console.log(
        `[ExportWorker] ↻ Requeued for retry (${retryMessage.retryCount}/${body.maxRetries}): ${messageId}`,
      );
    } else {
      await queueManager.ack(QUEUE_NAME, receiptHandle);
      console.log(
        `[ExportWorker] ✗ Max retries reached, message dropped: ${messageId}`,
      );
    }
  } catch (error) {
    console.error(
      `[ExportWorker] ✗ Failed to process message: ${messageId}`,
      error,
    );

    const retryMessage = { ...body, retryCount: (body.retryCount || 0) + 1 };

    if (retryMessage.retryCount < body.maxRetries) {
      try {
        await queueManager.enqueue(QUEUE_NAME, retryMessage);
        await queueManager.ack(QUEUE_NAME, receiptHandle);
        console.log(
          `[ExportWorker] ↻ Requeued after error (${retryMessage.retryCount}/${body.maxRetries}): ${messageId}`,
        );
      } catch (requeueError) {
        console.error(
          "[ExportWorker] Failed to requeue message:",
          requeueError,
        );
      }
    } else {
      try {
        await queueManager.ack(QUEUE_NAME, receiptHandle);
      } catch (deleteError) {
        console.error(
          "[ExportWorker] Failed to delete failed message:",
          deleteError,
        );
      }
    }
  }
}

// ─── Poll Loop ────────────────────────────────────────────────────────────────

async function start(signal) {
  console.log("[ExportWorker] 🚀 Starting...");

  while (!signal.aborted) {
    try {
      const messages = await queueManager.poll(QUEUE_NAME, BATCH_SIZE);

      if (messages.length === 0) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        continue;
      }

      console.log(`[ExportWorker] 📨 Received ${messages.length} message(s)`);

      for (const message of messages) {
        if (signal.aborted) break;
        await processMessage(message);
      }
    } catch (error) {
      console.error("[ExportWorker] Polling error:", error);
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
  }

  console.log("[ExportWorker] ⏸ Stopped.");
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const exportWorker = {
  start,
  QUEUE_NAME,
};

export default exportWorker;
