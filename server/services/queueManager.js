import {
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { sqs } from "../config/awsClient.js";
import { QUEUE_URL } from "../config/initAws.js";

const WORKFLOW_QUEUE = "crm-workflows"; // Different from your offline-writes queue

class QueueManager {
  constructor() {
    this.workflowQueueUrl = null;
  }

  /**
   * Initialize (called once on startup)
   * Note: Queue is already created in your initAws.js
   */
  async initialize() {
    // Your initAws.js creates the queue, we just use the URL
    this.workflowQueueUrl = QUEUE_URL; // Reuse your existing queue initialization pattern

    console.log(`✓ Queue Manager initialized: ${this.workflowQueueUrl}`);
  }

  /**
   * Send message to workflow queue
   *
   * @param {Object} message - Workflow message
   * @returns {Promise<string>} - Message ID
   */
  async sendMessage(message) {
    if (!this.workflowQueueUrl) {
      throw new Error("Queue not initialized. Call initialize() first.");
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

  setQueueUrl(url) {
    this.workflowQueueUrl = url;
  }
}

export const queueManager = new QueueManager();
export default queueManager;
