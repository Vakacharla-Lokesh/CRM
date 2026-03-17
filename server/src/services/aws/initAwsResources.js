import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketCorsCommand,
} from "@aws-sdk/client-s3";

import {
  CreateQueueCommand,
  GetQueueUrlCommand,
  GetQueueAttributesCommand,
  SetQueueAttributesCommand,
} from "@aws-sdk/client-sqs";

import { s3, sqs } from "./awsClient.js";
import envConfig from "../../config/envConfig.js";

const AWS_INIT_TIMEOUT_MS = 8000;

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`[AWS] ${label} timed out after ${ms}ms`)),
        ms,
      ),
    ),
  ]);
}

const REGION = envConfig.awsRegion || "us-east-1";

const BUCKETS = {
  leads: "crm-leads",
  workflows: "crm-workflows",
};

const QUEUES = {
  offlineWrites: "crm-offline-writes",
  exportData: "crm-export-data",
  campaignEmails: "crm-campaign-emails",
};

export const queueUrls = {
  offlineWrites: null,
  exportData: null,
  campaignEmails: null,
};

let _initPromise = null;

async function ensureBucket(bucketName) {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log(`[AWS] S3 bucket already exists: ${bucketName}`);
  } catch (err) {
    if (err?.$metadata?.httpStatusCode === 404) {
      console.log(`[AWS] Creating S3 bucket: ${bucketName}`);

      const params = { Bucket: bucketName };

      if (REGION !== "us-east-1") {
        params.CreateBucketConfiguration = { LocationConstraint: REGION };
      }

      await s3.send(new CreateBucketCommand(params));
      console.log(`[AWS] S3 bucket created: ${bucketName}`);
    } else {
      console.error(`[AWS] Error checking bucket ${bucketName}:`, err);
      throw err;
    }
  }
}

async function applyCors(bucketName) {
  const allowedOrigins = (envConfig.corsOrigin || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const origins = allowedOrigins.length
    ? allowedOrigins
    : ["http://localhost:5173", "http://localhost:4000"];

  await s3.send(
    new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "PUT", "POST"],
            AllowedOrigins: origins,
            ExposeHeaders: ["ETag"],
          },
        ],
      },
    }),
  );

  console.log(`[AWS] CORS applied to bucket: ${bucketName}`);
}

async function ensureQueue(queueName, attributes = {}) {
  try {
    const existing = await sqs.send(
      new GetQueueUrlCommand({ QueueName: queueName }),
    );
    console.log(`[AWS] SQS queue already exists: ${queueName}`);

    if (Object.keys(attributes).length > 0) {
      await sqs.send(
        new SetQueueAttributesCommand({
          QueueUrl: existing.QueueUrl,
          Attributes: attributes,
        }),
      );
      console.log(`[AWS] SQS queue attributes updated: ${queueName}`);
    }

    return existing.QueueUrl;
  } catch (err) {
    if (
      err?.$metadata?.httpStatusCode === 400 ||
      err?.name === "QueueDoesNotExist"
    ) {
      console.log(`[AWS] Creating SQS queue: ${queueName}`);
      const created = await sqs.send(
        new CreateQueueCommand({
          QueueName: queueName,
          Attributes: attributes,
        }),
      );
      console.log(`[AWS] SQS queue created: ${queueName}`);
      return created.QueueUrl;
    } else {
      console.error(`[AWS] Error checking queue ${queueName}:`, err);
      throw err;
    }
  }
}

export async function ensureAwsInitialized() {
  if (_initPromise) return _initPromise;

  _initPromise = withTimeout(
    (async () => {
      console.log("[AWS] Initializing LocalStack/AWS resources...");

      // S3 Buckets
      await ensureBucket(BUCKETS.leads);
      await ensureBucket(BUCKETS.workflows);

      await applyCors(BUCKETS.leads);
      await applyCors(BUCKETS.workflows);

      const dlqUrl = await ensureQueue("crm-dead-letter");

      const dlqAttrs = await sqs.send(
        new GetQueueAttributesCommand({
          QueueUrl: dlqUrl,
          AttributeNames: ["QueueArn"],
        }),
      );
      const dlqArn = dlqAttrs.Attributes.QueueArn;
      console.log(`[AWS] DLQ ARN resolved: ${dlqArn}`);

      const redrivePolicy = JSON.stringify({
        deadLetterTargetArn: dlqArn,
        maxReceiveCount: "3",
      });

      queueUrls.offlineWrites = await ensureQueue(QUEUES.offlineWrites, {
        VisibilityTimeout: "300",
        RedrivePolicy: redrivePolicy,
      });

      queueUrls.exportData = await ensureQueue(QUEUES.exportData, {
        VisibilityTimeout: "600",
        RedrivePolicy: redrivePolicy,
      });

      queueUrls.campaignEmails = await ensureQueue(QUEUES.campaignEmails, {
        VisibilityTimeout: "120",
        RedrivePolicy: redrivePolicy,
      });

      try {
        const { eventBridgeAdapter } = await import("./queue/eventbridge.js");

        const lambdaArn =
          process.env.LAMBDA_JOB_PROCESSOR_ARN ||
          "arn:aws:lambda:us-east-1:000000000000:function:crm-job-processor";

        const eventBridgeRoleArn =
          process.env.EVENTBRIDGE_ROLE_ARN ||
          "arn:aws:iam::000000000000:role/eventbridge-lambda-role";

        console.log("[AWS] Setting up EventBridge-to-Lambda dispatching...");

        const offlineWritesPattern = {
          source: ["aws.sqs"],
          detail: {
            eventSource: ["aws:sqs"],
            eventSourceARN: [
              `arn:aws:sqs:${REGION}:000000000000:${QUEUES.offlineWrites}`,
            ],
          },
        };

        await eventBridgeAdapter.ensureEventPatternRule(
          "crm-offline-writes-dispatcher",
          offlineWritesPattern,
          lambdaArn,
          eventBridgeRoleArn,
        );

        const exportDataPattern = {
          source: ["aws.sqs"],
          detail: {
            eventSource: ["aws:sqs"],
            eventSourceARN: [
              `arn:aws:sqs:${REGION}:000000000000:${QUEUES.exportData}`,
            ],
          },
        };

        await eventBridgeAdapter.ensureEventPatternRule(
          "crm-export-data-dispatcher",
          exportDataPattern,
          lambdaArn,
          eventBridgeRoleArn,
        );

        await eventBridgeAdapter.ensureScheduleRule(
          "crm-lead-reminder-schedule",
          "cron(0 10 * * ? *)",
          lambdaArn,
        );

        await eventBridgeAdapter.ensureScheduleRule(
          "crm-analytics-snapshot-schedule",
          "cron(0 2 * * ? *)",
          lambdaArn,
        );

        await eventBridgeAdapter.ensureScheduleRule(
          "crm-rfm-calculation-schedule",
          "cron(0 10 * * ? *)",
          lambdaArn,
        );

        console.log(
          "[AWS] EventBridge dispatchers configured (replaces localRunner polling)",
        );
      } catch (err) {
        console.warn("[AWS] EventBridge setup incomplete:", err.message);
        console.warn(
          "[AWS] Job processing may require local queue polling fallback.",
        );
      }

      console.log("[AWS] All resources ready.");
    })(),
    AWS_INIT_TIMEOUT_MS,
    "AWS initialization",
  ).catch((err) => {
    _initPromise = null;
    throw err;
  });

  return _initPromise;
}

export { BUCKETS, QUEUES };
