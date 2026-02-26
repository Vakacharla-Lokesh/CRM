import {
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  GetQueueAttributesCommand,
} from "@aws-sdk/client-sqs";
import { sqs } from "../config/awsClient.js";
import { QUEUE_URL, initAwsResources } from "../config/initAws.js";

export class QueueManager {
  constructor(defaultQueueUrl = null) {
    this.queueUrl = defaultQueueUrl;
  }

  async initialize(queueUrl = null) {
    if (queueUrl) {
      this.queueUrl = queueUrl;
    } else {
      // If AWS resources haven't been initialized yet (e.g. server process),
      // do it now so the queue URL is available.
      if (!QUEUE_URL) {
        await initAwsResources();
      }
      this.queueUrl = QUEUE_URL;
    }
    console.log(`✓ Queue Manager initialized: ${this.queueUrl}`);
  }

  async resolveQueueUrl(queueUrl) {
    const url = queueUrl || this.queueUrl;
    if (!url) {
      await this.initialize();
      return this.queueUrl;
    }
    return url;
  }

  async sendMessage(message, queueUrl = null) {
    const url = await this.resolveQueueUrl(queueUrl);

    try {
      const messageAttributes = {
        TenantId: {
          StringValue: message.tenantId,
          DataType: "String",
        },
        EntityType: {
          StringValue: message.entity.type,
          DataType: "String",
        },
      };

      // Optional WorkflowId
      if (message.workflowId) {
        messageAttributes.WorkflowId = {
          StringValue: message.workflowId,
          DataType: "String",
        };
      }

      // Optional EmailId
      if (message.emailId) {
        messageAttributes.EmailId = {
          StringValue: message.emailId,
          DataType: "String",
        };
      }

      const command = new SendMessageCommand({
        QueueUrl: url,
        MessageBody: JSON.stringify(message),
        MessageAttributes: messageAttributes,
      });

      const response = await sqs.send(command);
      console.log(`✓ Message sent to queue: ${response.MessageId}`);
      return response.MessageId;
    } catch (error) {
      console.error("Failed to send message to SQS:", error);
      throw error;
    }
  }

  async receiveMessages(maxMessages = 1, queueUrl = null) {
    const url = await this.resolveQueueUrl(queueUrl);

    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: url,
        MaxNumberOfMessages: Math.min(maxMessages, 10),
        WaitTimeSeconds: 10,
        MessageAttributeNames: ["All"],
      });

      const response = await sqs.send(command);

      if (!response.Messages || response.Messages.length === 0) {
        return [];
      }

      return response.Messages.map((msg) => ({
        messageId: msg.MessageId,
        receiptHandle: msg.ReceiptHandle,
        body: JSON.parse(msg.Body),
        attributes: msg.MessageAttributes,
      }));
    } catch (error) {
      console.error("Failed to receive messages:", error);
      throw error;
    }
  }

  async deleteMessage(receiptHandle, queueUrl = null) {
    const url = await this.resolveQueueUrl(queueUrl);

    try {
      const command = new DeleteMessageCommand({
        QueueUrl: url,
        ReceiptHandle: receiptHandle,
      });

      await sqs.send(command);
      console.log(`✓ Message deleted from queue`);
    } catch (error) {
      console.error("Failed to delete message:", error);
      throw error;
    }
  }

  async getQueueStats(queueUrl = null) {
    const url = await this.resolveQueueUrl(queueUrl);

    try {
      const command = new GetQueueAttributesCommand({
        QueueUrl: url,
        AttributeNames: [
          "ApproximateNumberOfMessages",
          "ApproximateNumberOfMessagesNotVisible",
        ],
      });

      const response = await sqs.send(command);
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
      console.error("Failed to get queue stats:", error);
      throw error;
    }
  }

  setQueueUrl(url) {
    this.queueUrl = url;
  }
}

// Default singleton – resolved to the AWS workflow queue URL on initialize().
export const queueManager = new QueueManager();
export default queueManager;
