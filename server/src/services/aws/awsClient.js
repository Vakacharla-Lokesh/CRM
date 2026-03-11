import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";
import { EventBridgeClient } from "@aws-sdk/client-eventbridge";
import envConfig from "../../config/envConfig.js";

const LOCALSTACK_ENDPOINT = envConfig.localstackEndpoint;

const isLocalStack = !!LOCALSTACK_ENDPOINT;

const credentials = isLocalStack
  ? { accessKeyId: "test", secretAccessKey: "test" }
  : undefined;

const baseConfig = {
  region: envConfig.awsRegion || "us-east-1",
  ...(isLocalStack && { endpoint: LOCALSTACK_ENDPOINT, credentials }),
};

export const s3 = new S3Client({
  ...baseConfig,
  forcePathStyle: true,
});

export const sqs = new SQSClient(baseConfig);

export const eventBridge = new EventBridgeClient(baseConfig);
