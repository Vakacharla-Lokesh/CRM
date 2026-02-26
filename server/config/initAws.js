import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketCorsCommand,
} from "@aws-sdk/client-s3";

import { CreateQueueCommand, GetQueueUrlCommand } from "@aws-sdk/client-sqs";

import { s3, sqs } from "./awsClient.js";

const REGION = process.env.AWS_REGION || "us-east-1";

const BUCKET = "crm-leads";
const WORKFLOWS_BUCKET = "crm-workflows";
const QUEUE = "crm-offline-writes";
const EXPORTQUEUE = "crm-export-data";

export let QUEUE_URL = null;
export let EXPORT_QUEUE_URL = null;

async function ensureBucket(bucketName) {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log(`S3 bucket already exists: ${bucketName}`);
  } catch (err) {
    if (err?.$metadata?.httpStatusCode === 404) {
      console.log(`Creating S3 bucket: ${bucketName}`);

      const params = { Bucket: bucketName };

      // Required for non us-east-1 in real AWS
      if (REGION !== "us-east-1") {
        params.CreateBucketConfiguration = {
          LocationConstraint: REGION,
        };
      }

      await s3.send(new CreateBucketCommand(params));
      console.log(`S3 bucket created: ${bucketName}`);
    } else {
      console.error(`Error checking bucket ${bucketName}`, err);
      throw err;
    }
  }
}

async function applyCors(bucketName) {
  await s3.send(
    new PutBucketCorsCommand({
      Bucket: bucketName,
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

  console.log(`CORS applied to bucket: ${bucketName}`);
}

async function ensureQueue(queueName) {
  try {
    const existing = await sqs.send(
      new GetQueueUrlCommand({ QueueName: queueName }),
    );

    console.log(`SQS queue already exists: ${queueName}`);
    return existing.QueueUrl;
  } catch (err) {
    if (
      err?.$metadata?.httpStatusCode === 400 ||
      err?.name === "QueueDoesNotExist"
    ) {
      console.log(`Creating SQS queue: ${queueName}`);

      const created = await sqs.send(
        new CreateQueueCommand({ QueueName: queueName }),
      );

      console.log(`SQS queue created: ${queueName}`);
      return created.QueueUrl;
    } else {
      console.error(`Error checking queue ${queueName}`, err);
      throw err;
    }
  }
}

export async function initAwsResources() {
  console.log("Initializing LocalStack/AWS resources...");

  await ensureBucket(BUCKET);
  await ensureBucket(WORKFLOWS_BUCKET);

  await applyCors(BUCKET);
  await applyCors(WORKFLOWS_BUCKET);

  QUEUE_URL = await ensureQueue(QUEUE);
  EXPORT_QUEUE_URL = await ensureQueue(EXPORTQUEUE);

  console.log("AWS resources ready.");
}
