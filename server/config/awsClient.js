import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";
import { SNSClient } from "@aws-sdk/client-sns";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../.env") });

const LOCALSTACK_ENDPOINT = process.env.LOCALSTACK_ENDPOINT;

const credentials = {
  accessKeyId: "test",
  secretAccessKey: "test",
};

export const s3 = new S3Client({
  region: "us-east-1",
  endpoint: LOCALSTACK_ENDPOINT,
  forcePathStyle: true,
  credentials,
});

export const sqs = new SQSClient({
  region: "us-east-1",
  endpoint: LOCALSTACK_ENDPOINT,
  credentials,
});

export const sns = new SNSClient({
  region: "us-east-1",
  endpoint: LOCALSTACK_ENDPOINT,
  credentials,
});
