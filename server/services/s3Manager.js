import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/awsClient.js";

const WORKFLOWS_BUCKET = "crm-workflows";
const LOCALSTACK_ENDPOINT = "http://localhost:4566";

class S3Manager {
  static buildS3Url(bucket, key) {
    return `${LOCALSTACK_ENDPOINT}/${bucket}/${key}`;
  }

  static async uploadFile(
    bucket,
    key,
    data,
    contentType = "application/octet-stream",
  ) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
      });

      const response = await s3.send(command);
      const url = this.buildS3Url(bucket, key);

      console.log(`✓ Uploaded to S3: ${url}`);
      return url;
    } catch (error) {
      console.error("Failed to upload to S3:", error);
      throw error;
    }
  }

  static async uploadString(bucket, key, content, contentType = "text/plain") {
    return this.uploadFile(bucket, key, Buffer.from(content), contentType);
  }

  static async uploadJSON(bucket, key, data) {
    const content = JSON.stringify(data, null, 2);
    return this.uploadString(bucket, key, content, "application/json");
  }

  static async downloadFile(bucket, key, fileName) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        ResponseContentDisposition: `attachment; filename="${fileName}"`,
      });

      const url = await getSignedUrl(s3, command, { expiresIn: 300 });

      console.log(`✓ Generated download URL for: ${key}`);
      return { url, fileName };
    } catch (error) {
      console.error("Failed to generate download URL:", error);
      throw error;
    }
  }

  static async deleteFile(bucket, key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await s3.send(command);
      console.log(`✓ Deleted from S3: ${key}`);
    } catch (error) {
      console.error("Failed to delete from S3:", error);
      throw error;
    }
  }

  static async getPresignedUploadUrl(bucket, key, fileSize) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentLength: fileSize,
      });

      const url = await getSignedUrl(s3, command, { expiresIn: 300 });

      console.log(`✓ Generated upload URL for: ${key}`);
      return url;
    } catch (error) {
      console.error("Failed to generate upload URL:", error);
      throw error;
    }
  }

  static async archiveLogs(tenantId, logs) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const key = `logs/${tenantId}/${timestamp}.json`;

    return this.uploadJSON(WORKFLOWS_BUCKET, key, {
      tenantId,
      archivedAt: new Date(),
      logCount: logs.length,
      logs,
    });
  }

  static getBucket() {
    return WORKFLOWS_BUCKET;
  }
}

export const s3Manager = S3Manager;
export default s3Manager;
