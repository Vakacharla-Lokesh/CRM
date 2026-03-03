import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";
import { EventBridgeClient } from "@aws-sdk/client-eventbridge";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../../../.env") });

const LOCALSTACK_ENDPOINT = process.env.LOCALSTACK_ENDPOINT;

const isLocalStack = !!LOCALSTACK_ENDPOINT;

const credentials = isLocalStack
  ? { accessKeyId: "test", secretAccessKey: "test" }
  : undefined;

const baseConfig = {
  region: process.env.AWS_REGION || "us-east-1",
  ...(isLocalStack && { endpoint: LOCALSTACK_ENDPOINT, credentials }),
};

export const s3 = new S3Client({
  ...baseConfig,
  forcePathStyle: true,
});

export const sqs = new SQSClient(baseConfig);

export const eventBridge = new EventBridgeClient(baseConfig);
