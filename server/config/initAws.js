import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketCorsCommand,
} from "@aws-sdk/client-s3";

import { CreateQueueCommand, GetQueueUrlCommand } from "@aws-sdk/client-sqs";

import { s3, sqs } from "./awsClient.js";

const BUCKET = "crm-leads";
const WORKFLOWS_BUCKET = "crm-workflows";
const QUEUE = "crm-offline-writes";
const EXPORTQUEUE = "crm-export-data";

export let QUEUE_URL = null;
export let EXPORT_QUEUE_URL = null;

export async function initAwsResources() {
  console.log("Initializing LocalStack resources...");

  // ---------- S3 BUCKETS ----------
  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET }));
    console.log("S3 bucket already exists:", BUCKET);
  } catch {
    console.log("Creating S3 bucket:", BUCKET);
    await s3.send(new CreateBucketCommand({ Bucket: BUCKET }));
    console.log("S3 bucket created:", BUCKET);
  }

  try {
    await s3.send(new HeadBucketCommand({ Bucket: WORKFLOWS_BUCKET }));
    console.log("S3 bucket already exists:", WORKFLOWS_BUCKET);
  } catch {
    console.log("Creating S3 bucket:", WORKFLOWS_BUCKET);
    await s3.send(new CreateBucketCommand({ Bucket: WORKFLOWS_BUCKET }));
    console.log("S3 bucket created:", WORKFLOWS_BUCKET);
  }

  await s3.send(
    new PutBucketCorsCommand({
      Bucket: BUCKET,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "PUT", "POST"],
            AllowedOrigins: ["http://localhost:5173", "http://localhost:3000"],
            ExposeHeaders: ["ETag"],
          },
        ],
      },
    }),
  );

  // ---------- SQS QUEUE ----------
  try {
    const existing = await sqs.send(
      new GetQueueUrlCommand({ QueueName: QUEUE }),
    );
    QUEUE_URL = existing.QueueUrl;
    console.log("SQS queue already exists");
  } catch {
    console.log("Creating SQS queue...");
    const created = await sqs.send(
      new CreateQueueCommand({ QueueName: QUEUE }),
    );
    QUEUE_URL = created.QueueUrl;
    console.log("SQS queue created");
  }

  // EXPORT QUEUE
  try {
    const existing = await sqs.send(
      new GetQueueUrlCommand({ QueueName: EXPORTQUEUE }),
    );
    EXPORT_QUEUE_URL = existing.QueueUrl;
    console.log("SQS queue already exists");
  } catch {
    console.log("Creating SQS queue...");
    const created = await sqs.send(
      new CreateQueueCommand({ QueueName: EXPORTQUEUE }),
    );
    EXPORT_QUEUE_URL = created.QueueUrl;
    console.log("SQS queue created");
  }

  console.log("LocalStack ready.");
}
