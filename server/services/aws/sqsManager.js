import {
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  GetQueueAttributesCommand,
} from "@aws-sdk/client-sqs";
import { sqs } from "./awsClient.js";

// ─── Core SQS Operations ──────────────────────────────────────────────────────

/**
 * Sends a message to the given SQS queue URL.
 * MessageAttributes are built dynamically — no undefined/null values allowed.
 */
async function sendMessage(queueUrl, message) {
  if (!queueUrl) throw new Error("[SQS] queueUrl is required for sendMessage");

  const messageAttributes = {};

  if (message.tenantId) {
    messageAttributes.TenantId = { StringValue: String(message.tenantId), DataType: "String" };
  }
  if (message.entity?.type) {
    messageAttributes.EntityType = { StringValue: message.entity.type, DataType: "String" };
  }
  if (message.workflowId) {
    messageAttributes.WorkflowId = { StringValue: String(message.workflowId), DataType: "String" };
  }
  if (message.emailId) {
    messageAttributes.EmailId = { StringValue: String(message.emailId), DataType: "String" };
  }

  try {
    const response = await sqs.send(
      new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(message),
        MessageAttributes: messageAttributes,
      }),
    );
    console.log(`[SQS] Message sent: ${response.MessageId}`);
    return response.MessageId;
  } catch (error) {
    console.error("[SQS] Failed to send message:", error);
    throw error;
  }
}

/**
 * Long-polls the given queue and returns normalized message objects.
 */
async function receiveMessages(queueUrl, maxMessages = 1) {
  if (!queueUrl) throw new Error("[SQS] queueUrl is required for receiveMessages");

  try {
    const response = await sqs.send(
      new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: Math.min(maxMessages, 10),
        WaitTimeSeconds: 10,
        MessageAttributeNames: ["All"],
      }),
    );

    if (!response.Messages?.length) return [];

    return response.Messages.map((msg) => ({
      messageId: msg.MessageId,
      receiptHandle: msg.ReceiptHandle,
      body: JSON.parse(msg.Body),
      attributes: msg.MessageAttributes,
    }));
  } catch (error) {
    console.error("[SQS] Failed to receive messages:", error);
    throw error;
  }
}

/**
 * Deletes a processed message from the given queue.
 */
async function deleteMessage(queueUrl, receiptHandle) {
  if (!queueUrl) throw new Error("[SQS] queueUrl is required for deleteMessage");

  try {
    await sqs.send(
      new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: receiptHandle }),
    );
    console.log("[SQS] Message deleted from queue");
  } catch (error) {
    console.error("[SQS] Failed to delete message:", error);
    throw error;
  }
}

/**
 * Returns approximate queue depth metrics.
 */
async function getQueueStats(queueUrl) {
  if (!queueUrl) throw new Error("[SQS] queueUrl is required for getQueueStats");

  try {
    const response = await sqs.send(
      new GetQueueAttributesCommand({
        QueueUrl: queueUrl,
        AttributeNames: [
          "ApproximateNumberOfMessages",
          "ApproximateNumberOfMessagesNotVisible",
        ],
      }),
    );

    const attrs = response.Attributes || {};
    return {
      approximateMessages: parseInt(attrs.ApproximateNumberOfMessages || "0", 10),
      processingMessages: parseInt(attrs.ApproximateNumberOfMessagesNotVisible || "0", 10),
    };
  } catch (error) {
    console.error("[SQS] Failed to get queue stats:", error);
    throw error;
  }
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const sqsManager = {
  sendMessage,
  receiveMessages,
  deleteMessage,
  getQueueStats,
};

export default sqsManager;
