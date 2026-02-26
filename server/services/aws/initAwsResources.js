import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketCorsCommand,
} from "@aws-sdk/client-s3";

import { CreateQueueCommand, GetQueueUrlCommand } from "@aws-sdk/client-sqs";

import { s3, sqs } from "./awsClient.js";

// ─── Constants ────────────────────────────────────────────────────────────────

const REGION = process.env.AWS_REGION || "us-east-1";

const BUCKETS = {
  leads: "crm-leads",
  workflows: "crm-workflows",
};

const QUEUES = {
  offlineWrites: "crm-offline-writes",
  exportData: "crm-export-data",
};

// ─── Resolved Queue URLs (populated after init) ───────────────────────────────

export const queueUrls = {
  offlineWrites: null,
  exportData: null,
};

// ─── Idempotency guard ────────────────────────────────────────────────────────

let _initPromise = null;

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function ensureBucket(bucketName) {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log(`[AWS] S3 bucket already exists: ${bucketName}`);
  } catch (err) {
    if (err?.$metadata?.httpStatusCode === 404) {
      console.log(`[AWS] Creating S3 bucket: ${bucketName}`);

      const params = { Bucket: bucketName };

      // Required for non us-east-1 regions in real AWS
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

  // Always include localhost defaults for development
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

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Initializes all AWS/LocalStack resources exactly once per process.
 * Safe to call from multiple places — subsequent calls return the same promise.
 */
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

    console.log("[AWS] All resources ready.");
  })();

  return _initPromise;
}

export { BUCKETS, QUEUES };
