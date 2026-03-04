import { eventBridgeAdapter } from "../queue/eventbridge.adapter.js";
import { isValidJobType, JOB_TYPE_QUEUE_MAP } from "../../../utils/jobTypes.js";

async function delegateJobViaEventBridge(jobType, payload, tenantId) {
  if (!isValidJobType(jobType)) {
    throw new Error(`[EventBridgeService] Unknown job type: "${jobType}"`);
  }

  const queueName = JOB_TYPE_QUEUE_MAP[jobType];
  if (!queueName) {
    throw new Error(
      `[EventBridgeService] No queue mapped for job type: "${jobType}"`,
    );
  }

  const detail = {
    jobType,
    tenantId,
    payload,
    enqueuedAt: new Date().toISOString(),
  };

  try {
    const response = await eventBridgeAdapter.putEvent(
      "crm.jobs",
      jobType,
      detail,
    );

    const failedCount = response.FailedEntryCount || 0;
    if (failedCount > 0) {
      console.error("[EventBridgeService] Event delegation failed:", {
        jobType,
        failureCount: failedCount,
      });
      throw new Error(
        `[EventBridgeService] Failed to delegate job: ${jobType}`,
      );
    }

    console.log(
      `[EventBridgeService] ✓ Job delegated: ${jobType} for tenant: ${tenantId}`,
    );
    return response.Entries?.[0]?.EventId;
  } catch (error) {
    console.error("[EventBridgeService] ❌ Error delegating job:", {
      jobType,
      error: error.message,
    });
    throw error;
  }
}

async function setupJobDispatcher(lambdaArn, roleArn) {
  try {
    console.log("[EventBridgeService] 🔧 Setting up job dispatcher...");

    const ruleName = "crm-job-dispatcher";

    const eventPattern = {
      source: ["crm.jobs"],
      detail: {
        jobType: [
          "exportData",
          "offlineWrites",
          "workflowExecution",
          "leadReminder",
        ],
      },
    };

    await eventBridgeAdapter.ensureEventPatternRule(
      ruleName,
      eventPattern,
      lambdaArn,
      roleArn,
    );

    console.log("[EventBridgeService] ✓ Job dispatcher configured");
  } catch (error) {
    console.error("[EventBridgeService] ❌ Failed to setup dispatcher:", {
      error: error.message,
    });
    throw error;
  }
}

async function setupSqsQueueDispatcher(sqsArn, lambdaArn, roleArn) {
  try {
    console.log("[EventBridgeService] 🔧 Setting up SQS queue dispatcher...");

    const ruleName = "crm-sqs-queue-dispatcher";

    const eventPattern = {
      source: ["aws.sqs"],
      detail: {
        messageAttributes: {
          jobType: {
            stringValue: [
              "exportData",
              "offlineWrites",
              "workflowExecution",
              "leadReminder",
            ],
          },
        },
      },
    };

    await eventBridgeAdapter.ensureEventPatternRule(
      ruleName,
      eventPattern,
      lambdaArn,
      roleArn,
    );

    console.log("[EventBridgeService] ✓ SQS queue dispatcher configured");
  } catch (error) {
    console.error("[EventBridgeService] ❌ Failed to setup SQS dispatcher:", {
      error: error.message,
    });
    throw error;
  }
}

export const eventBridgeService = {
  delegateJobViaEventBridge,
  setupJobDispatcher,
  setupSqsQueueDispatcher,
};

export default eventBridgeService;
