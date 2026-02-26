/**
 * @deprecated
 * This file is a backward-compatibility shim.
 *
 * New code must import from `../services/queue/queueManager.js`:
 *   import { queueManager } from './queue/queueManager.js';
 *
 * The new queueManager API uses:
 *   queueManager.enqueue(queueName, message)  — producer
 *   queueManager.poll(queueName, batchSize)   — consumer
 *   queueManager.ack(queueName, receiptHandle) — delete after processing
 */

export { queueManager, default } from "./queue/queueManager.js";

// The old code used `new QueueManager(url)` — export a stub class for compat.
// Callers should migrate to the singleton queueManager exported above.
import { sqsManager } from "./aws/sqsManager.js";

export class QueueManager {
  constructor(defaultQueueUrl = null) {
    this.queueUrl = defaultQueueUrl;
    console.warn(
      "[Deprecated] QueueManager class is deprecated. Use the queueManager singleton from services/queue/queueManager.js instead.",
    );
  }

  async initialize(queueUrl = null) {
    if (queueUrl) this.queueUrl = queueUrl;
  }

  async sendMessage(message, queueUrl = null) {
    const url = queueUrl || this.queueUrl;
    if (!url) throw new Error("[QueueManager] No queue URL configured");
    return sqsManager.sendMessage(url, message);
  }

  async receiveMessages(maxMessages = 1, queueUrl = null) {
    const url = queueUrl || this.queueUrl;
    if (!url) throw new Error("[QueueManager] No queue URL configured");
    return sqsManager.receiveMessages(url, maxMessages);
  }

  async deleteMessage(receiptHandle, queueUrl = null) {
    const url = queueUrl || this.queueUrl;
    if (!url) throw new Error("[QueueManager] No queue URL configured");
    return sqsManager.deleteMessage(url, receiptHandle);
  }

  async getQueueStats(queueUrl = null) {
    const url = queueUrl || this.queueUrl;
    if (!url) throw new Error("[QueueManager] No queue URL configured");
    return sqsManager.getQueueStats(url);
  }

  setQueueUrl(url) {
    this.queueUrl = url;
  }
}
