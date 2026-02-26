import {
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  GetQueueAttributesCommand,
} from "@aws-sdk/client-sqs";
import { sqs } from "../config/awsClient.js";
import { QUEUE_URL, initAwsResources } from "../config/initAws.js";

const WORKFLOW_QUEUE = "crm-workflows";

class QueueManager {
  constructor() {
    this.workflowQueueUrl = null;
  }

  async initialize() {
    // If AWS resources haven't been initialized yet (e.g. server process),
    // do it now so the queue URL is available.
    if (!QUEUE_URL) {
      await initAwsResources();
    }
    this.workflowQueueUrl = QUEUE_URL;
    console.log(`✓ Queue Manager initialized: ${this.workflowQueueUrl}`);
  }

  async sendMessage(message) {
    if (!this.workflowQueueUrl) {
      await this.initialize();
    }

    try {
      const command = new SendMessageCommand({
        QueueUrl: this.workflowQueueUrl,
        MessageBody: JSON.stringify(message),
        MessageAttributes: {
          TenantId: {
            StringValue: message.tenantId,
            DataType: "String",
          },
          WorkflowId: {
            StringValue: message.workflowId,
            DataType: "String",
          },
          EntityType: {
            StringValue: message.entity.type,
            DataType: "String",
          },
        },
      });

      const response = await sqs.send(command);
      console.log(`✓ Message sent to queue: ${response.MessageId}`);
      return response.MessageId;
    } catch (error) {
      console.error("Failed to send message to SQS:", error);
      throw error;
    }
  }

  async receiveMessages(maxMessages = 1) {
    if (!this.workflowQueueUrl) {
      throw new Error("Queue not initialized");
    }

    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: this.workflowQueueUrl,
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

  async deleteMessage(receiptHandle) {
    if (!this.workflowQueueUrl) {
      throw new Error("Queue not initialized");
    }

    try {
      const command = new DeleteMessageCommand({
        QueueUrl: this.workflowQueueUrl,
        ReceiptHandle: receiptHandle,
      });

      await sqs.send(command);
      console.log(`✓ Message deleted from queue`);
    } catch (error) {
      console.error("Failed to delete message:", error);
      throw error;
    }
  }

  async getQueueStats() {
    if (!this.workflowQueueUrl) {
      throw new Error("Queue not initialized");
    }

    try {
      const command = new GetQueueAttributesCommand({
        QueueUrl: this.workflowQueueUrl,
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
    this.workflowQueueUrl = url;
  }
}

export const queueManager = new QueueManager();
export default queueManager;
