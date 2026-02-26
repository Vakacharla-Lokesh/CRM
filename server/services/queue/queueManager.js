import { sqsManager } from "../aws/sqsManager.js";
import { queueUrls } from "../aws/initAwsResources.js";

// ─── Registry ─────────────────────────────────────────────────────────────────

/**
 * Map<queueName, queueUrl>  — populated by registerQueue()
 */
const _queueRegistry = new Map();

// ─── Queue Registration ───────────────────────────────────────────────────────

/**
 * Registers a named queue URL so workers can look it up by name.
 * Called once during bootstrap (workers/index.js) after AWS is initialized.
 *
 * @param {string} name  - Logical name, e.g. "crm-offline-writes"
 * @param {string} url   - The resolved SQS queue URL
 */
function registerQueue(name, url) {
  if (!name || !url) throw new Error(`[QueueManager] registerQueue requires name and url`);
  _queueRegistry.set(name, url);
  console.log(`[QueueManager] Registered queue "${name}": ${url}`);
}

/**
 * Returns the resolved queue URL for a registered queue name.
 * Throws if the queue has not been registered.
 *
 * @param {string} name
 * @returns {string}
 */
function getQueueUrl(name) {
  const url = _queueRegistry.get(name);
  if (!url) {
    throw new Error(
      `[QueueManager] Queue "${name}" is not registered. Call registerQueue() during bootstrap.`,
    );
  }
  return url;
}

/**
 * Bootstraps the queue registry from the resolved AWS queue URLs.
 * Must be called after ensureAwsInitialized().
 */
function bootstrap() {
  for (const [key, url] of Object.entries(queueUrls)) {
    if (url) {
      // Convert camelCase key to queue name: offlineWrites → crm-offline-writes
      // We store by the queue URL key name for simplicity
      _queueRegistry.set(key, url);
    }
  }
  console.log(`[QueueManager] Bootstrapped with ${_queueRegistry.size} queue(s).`);
}

// ─── Producer API ─────────────────────────────────────────────────────────────

/**
 * Sends a message to a named (registered) queue.
 *
 * @param {string} queueName  - Logical name registered via registerQueue()
 * @param {object} message    - Message payload (will be JSON serialized)
 * @returns {Promise<string>} - SQS MessageId
 */
async function enqueue(queueName, message) {
  const url = getQueueUrl(queueName);
  return sqsManager.sendMessage(url, message);
}

// ─── Consumer API ─────────────────────────────────────────────────────────────

/**
 * Polls a named (registered) queue and returns messages.
 *
 * @param {string} queueName
 * @param {number} [maxMessages=1]
 */
async function poll(queueName, maxMessages = 1) {
  const url = getQueueUrl(queueName);
  return sqsManager.receiveMessages(url, maxMessages);
}

/**
 * Deletes a processed message from a named (registered) queue.
 *
 * @param {string} queueName
 * @param {string} receiptHandle
 */
async function ack(queueName, receiptHandle) {
  const url = getQueueUrl(queueName);
  return sqsManager.deleteMessage(url, receiptHandle);
}

/**
 * Returns approximate queue depth for a named queue.
 *
 * @param {string} queueName
 */
async function stats(queueName) {
  const url = getQueueUrl(queueName);
  return sqsManager.getQueueStats(url);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const queueManager = {
  registerQueue,
  getQueueUrl,
  bootstrap,
  enqueue,
  poll,
  ack,
  stats,
};

export default queueManager;
