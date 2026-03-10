import { sqsAdapter } from "./sqsHandler.js";
import { queueUrls } from "../initAwsResources.js";
import { isValidJobType, JOB_TYPE_QUEUE_MAP } from "../../../utils/jobTypes.js";

const _queueRegistry = new Map();

function bootstrap() {
  for (const [key, url] of Object.entries(queueUrls)) {
    if (url) {
      _queueRegistry.set(key, url);
    }
  }
  console.log(
    `[QueueService] Bootstrapped with ${_queueRegistry.size} queue(s).`,
  );
}

function getQueueUrl(name) {
  const url = _queueRegistry.get(name);
  if (!url) {
    throw new Error(
      `[QueueService] Queue "${name}" is not registered. Call bootstrap() during startup.`,
    );
  }
  return url;
}

function registerQueue(name, url) {
  if (!name || !url)
    throw new Error("[QueueService] registerQueue requires name and url");
  _queueRegistry.set(name, url);
  console.log(`[QueueService] Registered queue "${name}": ${url}`);
}

async function enqueueJob(jobType, payload, tenantId) {
  if (!isValidJobType(jobType)) {
    throw new Error(`[QueueService] Unknown job type: "${jobType}"`);
  }

  const queueName = JOB_TYPE_QUEUE_MAP[jobType];
  if (!queueName) {
    throw new Error(
      `[QueueService] No queue mapped for job type: "${jobType}"`,
    );
  }

  const url = getQueueUrl(queueName);

  const messageBody = {
    jobType,
    tenantId,
    payload,
    enqueuedAt: new Date().toISOString(),
  };

  const attributes = {
    tenantId,
    jobType,
    entityType: payload?.entity?.type,
  };

  const messageId = await sqsAdapter.sendMessage(url, messageBody, attributes);

  console.log(
    `[QueueService] Enqueued job: ${jobType} (message: ${messageId})`,
  );

  return messageId;
}

async function ack(queueName, receiptHandle) {
  const url = getQueueUrl(queueName);
  return sqsAdapter.deleteMessage(url, receiptHandle);
}

async function poll(queueName, maxMessages = 1) {
  const url = getQueueUrl(queueName);
  return sqsAdapter.receiveMessages(url, maxMessages);
}

async function stats(queueName) {
  const url = getQueueUrl(queueName);
  return sqsAdapter.getQueueStats(url);
}

export const queueService = {
  bootstrap,
  registerQueue,
  getQueueUrl,
  enqueueJob,
  ack,
  poll,
  stats,
};

export default queueService;
