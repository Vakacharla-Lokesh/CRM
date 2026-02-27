import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketCorsCommand,
} from "@aws-sdk/client-s3";

import { CreateQueueCommand, GetQueueUrlCommand } from "@aws-sdk/client-sqs";
import {
  CreateTableCommand,
  DescribeTableCommand,
} from "@aws-sdk/client-dynamodb";

import { s3, sqs, dynamoDb } from "./awsClient.js";

const REGION = process.env.AWS_REGION || "us-east-1";

const TABLES = {
  jobs: "jobs",
};

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

async function ensureDynamoTable(tableName) {
  try {
    await dynamoDb.send(new DescribeTableCommand({ TableName: tableName }));
    console.log(`[AWS] DynamoDB table already exists: ${tableName}`);
  } catch (err) {
    if (err.name === "ResourceNotFoundException") {
      console.log(`[AWS] Creating DynamoDB table: ${tableName}`);

      const params = {
        TableName: tableName,
        AttributeDefinitions: [
          { AttributeName: "jobId", AttributeType: "S" },
          { AttributeName: "tenantId", AttributeType: "S" },
        ],
        KeySchema: [
          { AttributeName: "jobId", KeyType: "HASH" },
          { AttributeName: "tenantId", KeyType: "RANGE" },
        ],
        BillingMode: "PAY_PER_REQUEST",
      };

      await dynamoDb.send(new CreateTableCommand(params));
      console.log(`[AWS] DynamoDB table created: ${tableName}`);
    } else {
      console.error(`[AWS] Error checking DynamoDB table ${tableName}:`, err);
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

    // DynamoDB Table
    await ensureDynamoTable(TABLES.jobs);

    // EventBridge Rules (best-effort)
    try {
      const { eventBridgeAdapter } =
        await import("../../src/infrastructure/queue/eventbridge.adapter.js");

      const lambdaArn =
        process.env.LAMBDA_JOB_PROCESSOR_ARN ||
        "arn:aws:lambda:us-east-1:000000000000:function:crm-job-processor";

      await eventBridgeAdapter.ensureScheduleRule(
        "crm-lead-reminder-schedule",
        "cron(0 10 * * ? *)",
        lambdaArn,
      );
    } catch (err) {
      console.warn("[AWS] EventBridge setup skipped:", err.message);
    }

    console.log("[AWS] All resources ready.");
  })();

  return _initPromise;
}

export { BUCKETS, QUEUES, TABLES };
