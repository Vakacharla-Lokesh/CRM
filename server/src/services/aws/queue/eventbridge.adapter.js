import {
  PutRuleCommand,
  PutTargetsCommand,
  RemoveTargetsCommand,
  DeleteRuleCommand,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import { eventBridge } from "../awsClient.js";

async function ensureScheduleRule(ruleName, scheduleExpression, targetArn) {
  try {
    await eventBridge.send(
      new PutRuleCommand({
        Name: ruleName,
        ScheduleExpression: scheduleExpression,
        State: "ENABLED",
      }),
    );
    console.log(`[EventBridge] Rule created/updated: ${ruleName}`);

    await eventBridge.send(
      new PutTargetsCommand({
        Rule: ruleName,
        Targets: [
          {
            Id: `${ruleName}-target`,
            Arn: targetArn,
          },
        ],
      }),
    );
    console.log(`[EventBridge] Target set for rule: ${ruleName}`);
  } catch (error) {
    console.warn(
      `[EventBridge] Failed to create rule "${ruleName}":`,
      error.message,
    );
    console.warn(
      "[EventBridge] Scheduled rules may need manual configuration.",
    );
  }
}

async function putEvent(source, detailType, detail) {
  try {
    const response = await eventBridge.send(
      new PutEventsCommand({
        Entries: [
          {
            Source: source,
            DetailType: detailType,
            Detail:
              typeof detail === "string" ? detail : JSON.stringify(detail),
          },
        ],
      }),
    );

    const failedCount = response.FailedEntryCount || 0;
    if (failedCount > 0) {
      console.error("[EventBridge] Some events failed:", response.Entries);
    } else {
      console.log(`[EventBridge] Event published: ${source}/${detailType}`);
    }

    return response;
  } catch (error) {
    console.error("[EventBridge] Failed to put event:", error);
    throw error;
  }
}

async function removeRule(ruleName) {
  try {
    await eventBridge.send(
      new RemoveTargetsCommand({
        Rule: ruleName,
        Ids: [`${ruleName}-target`],
      }),
    );

    await eventBridge.send(
      new DeleteRuleCommand({
        Name: ruleName,
      }),
    );

    console.log(`[EventBridge] Rule deleted: ${ruleName}`);
  } catch (error) {
    console.error(
      `[EventBridge] Failed to delete rule "${ruleName}":`,
      error.message,
    );
  }
}

export const eventBridgeAdapter = {
  ensureScheduleRule,
  putEvent,
  removeRule,
};

export default eventBridgeAdapter;
