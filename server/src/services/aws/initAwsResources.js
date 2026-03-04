import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketCorsCommand,
} from "@aws-sdk/client-s3";

import { CreateQueueCommand, GetQueueUrlCommand } from "@aws-sdk/client-sqs";

import { s3, sqs } from "./awsClient.js";

const REGION = process.env.AWS_REGION || "us-east-1";

const BUCKETS = {
  leads: "crm-leads",
  workflows: "crm-workflows",
};

const QUEUES = {
  offlineWrites: "crm-offline-writes",
  exportData: "crm-export-data",
};

export const queueUrls = {
  offlineWrites: null,
  exportData: null,
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
  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const origins = allowedOrigins.length
    ? allowedOrigins
    : ["http://localhost:5173", "http://localhost:3000"];

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

async function ensureQueue(queueName) {
  try {
    const existing = await sqs.send(
      new GetQueueUrlCommand({ QueueName: queueName }),
    );
    console.log(`[AWS] SQS queue already exists: ${queueName}`);
    return existing.QueueUrl;
  } catch (err) {
    if (
      err?.$metadata?.httpStatusCode === 400 ||
      err?.name === "QueueDoesNotExist"
    ) {
      console.log(`[AWS] Creating SQS queue: ${queueName}`);
      const created = await sqs.send(
        new CreateQueueCommand({ QueueName: queueName }),
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

  _initPromise = (async () => {
    console.log("[AWS] Initializing LocalStack/AWS resources...");

    // S3 Buckets
    await ensureBucket(BUCKETS.leads);
    await ensureBucket(BUCKETS.workflows);

    await applyCors(BUCKETS.leads);
    await applyCors(BUCKETS.workflows);

    // SQS Queues — store resolved URLs
    queueUrls.offlineWrites = await ensureQueue(QUEUES.offlineWrites);
    queueUrls.exportData = await ensureQueue(QUEUES.exportData);

    try {
      const { eventBridgeAdapter } =
        await import("./queue/eventbridge.adapter.js");

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

      console.log(
        "[AWS] ✓ EventBridge dispatchers configured (replaces localRunner polling)",
      );
    } catch (err) {
      console.warn("[AWS] EventBridge setup incomplete:", err.message);
      console.warn(
        "[AWS] Job processing may require local queue polling fallback.",
      );
    }

    console.log("[AWS] All resources ready.");
  })();

  return _initPromise;
}

export { BUCKETS, QUEUES };
