import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";
import { SNSClient } from "@aws-sdk/client-sns";

const LOCALSTACK_ENDPOINT = "http://localhost:4566";

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
