import {
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  GetQueueAttributesCommand,
} from "@aws-sdk/client-sqs";
import { sqs } from "../awsClient.js";

async function sendMessage(queueUrl, messageBody, attributes = {}) {
  if (!queueUrl) throw new Error("[SQS] queueUrl is required for sendMessage");

  const messageAttributes = {};

  if (attributes.tenantId) {
    messageAttributes.TenantId = {
      StringValue: String(attributes.tenantId),
      DataType: "String",
    };
  }
  if (attributes.jobType) {
    messageAttributes.JobType = {
      StringValue: String(attributes.jobType),
      DataType: "String",
    };
  }
  if (attributes.entityType) {
    messageAttributes.EntityType = {
      StringValue: attributes.entityType,
      DataType: "String",
    };
  }

  try {
    const response = await sqs.send(
      new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody:
          typeof messageBody === "string"
            ? messageBody
            : JSON.stringify(messageBody),
        ...(Object.keys(messageAttributes).length > 0 && {
          MessageAttributes: messageAttributes,
        }),
      }),
    );
    console.log(`[SQS] Message sent: ${response.MessageId}`);
    return response.MessageId;
  } catch (error) {
    console.error("[SQS] Failed to send message:", error);
    throw error;
  }
}

async function receiveMessages(queueUrl, maxMessages = 1) {
  if (!queueUrl)
    throw new Error("[SQS] queueUrl is required for receiveMessages");

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

async function deleteMessage(queueUrl, receiptHandle) {
  if (!queueUrl)
    throw new Error("[SQS] queueUrl is required for deleteMessage");

  try {
    await sqs.send(
      new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
      }),
    );
    console.log("[SQS] Message deleted from queue");
  } catch (error) {
    console.error("[SQS] Failed to delete message:", error);
    throw error;
  }
}

async function getQueueStats(queueUrl) {
  if (!queueUrl)
    throw new Error("[SQS] queueUrl is required for getQueueStats");

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
      approximateMessages: parseInt(
        attrs.ApproximateNumberOfMessages || "0",
        10,
      ),
      processingMessages: parseInt(
        attrs.ApproximateNumberOfMessagesNotVisible || "0",
        10,
      ),
    };
  } catch (error) {
    console.error("[SQS] Failed to get queue stats:", error);
    throw error;
  }
}

export const sqsAdapter = {
  sendMessage,
  receiveMessages,
  deleteMessage,
  getQueueStats,
};

export default sqsAdapter;
