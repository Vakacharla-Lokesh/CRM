import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";
import { SNSClient } from "@aws-sdk/client-sns";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../../.env") });

const LOCALSTACK_ENDPOINT = process.env.LOCALSTACK_ENDPOINT;

const isLocalStack = !!LOCALSTACK_ENDPOINT;

const credentials = isLocalStack
  ? { accessKeyId: "test", secretAccessKey: "test" }
  : undefined; // Let AWS SDK pick credentials from environment in production

const baseConfig = {
  region: process.env.AWS_REGION || "us-east-1",
  ...(isLocalStack && { endpoint: LOCALSTACK_ENDPOINT, credentials }),
};

export const s3 = new S3Client({
  ...baseConfig,
  forcePathStyle: true, // Required for LocalStack and path-style S3 access
});

export const sqs = new SQSClient(baseConfig);

export const sns = new SNSClient(baseConfig);

export const dynamoDb = new DynamoDBClient(baseConfig);

export const docClient = DynamoDBDocumentClient.from(dynamoDb, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});
