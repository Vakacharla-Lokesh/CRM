import { sns } from "./awsClient.js";
import {
  PublishCommand,
  CreateTopicCommand,
  SubscribeCommand,
  ListTopicsCommand,
} from "@aws-sdk/client-sns";

// ─── SNS Operations ───────────────────────────────────────────────────────────

/**
 * Publishes a message to an SNS topic.
 */
async function publish(topicArn, message, subject = "") {
  if (!topicArn) throw new Error("[SNS] topicArn is required for publish");

  try {
    const response = await sns.send(
      new PublishCommand({
        TopicArn: topicArn,
        Message: typeof message === "string" ? message : JSON.stringify(message),
        Subject: subject,
      }),
    );
    console.log(`[SNS] Message published: ${response.MessageId}`);
    return response.MessageId;
  } catch (error) {
    console.error("[SNS] Failed to publish message:", error);
    throw error;
  }
}

/**
 * Creates an SNS topic if it does not already exist, returns the ARN.
 */
async function ensureTopic(topicName) {
  try {
    const response = await sns.send(
      new CreateTopicCommand({ Name: topicName }),
    );
    console.log(`[SNS] Topic ready: ${response.TopicArn}`);
    return response.TopicArn;
  } catch (error) {
    console.error("[SNS] Failed to ensure topic:", error);
    throw error;
  }
}

/**
 * Subscribes an endpoint (e.g. SQS ARN, HTTPS URL) to an SNS topic.
 */
async function subscribe(topicArn, protocol, endpoint) {
  try {
    const response = await sns.send(
      new SubscribeCommand({ TopicArn: topicArn, Protocol: protocol, Endpoint: endpoint }),
    );
    console.log(`[SNS] Subscribed (${protocol}): ${response.SubscriptionArn}`);
    return response.SubscriptionArn;
  } catch (error) {
    console.error("[SNS] Failed to subscribe:", error);
    throw error;
  }
}

/**
 * Lists all SNS topics in the current region.
 */
async function listTopics() {
  try {
    const response = await sns.send(new ListTopicsCommand({}));
    return (response.Topics || []).map((t) => t.TopicArn);
  } catch (error) {
    console.error("[SNS] Failed to list topics:", error);
    throw error;
  }
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const snsManager = {
  publish,
  ensureTopic,
  subscribe,
  listTopics,
};

export default snsManager;
