import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "./awsClient.js";
import { BUCKETS } from "./initAwsResources.js";

const SIGNED_URL_EXPIRY_SECONDS = 300;

// ─── Internal helpers ─────────────────────────────────────────────────────────

function buildS3Url(bucket, key) {
  const endpoint =
    process.env.LOCALSTACK_ENDPOINT || "https://s3.amazonaws.com";
  return `${endpoint}/${bucket}/${key}`;
}

// ─── S3 Operations ────────────────────────────────────────────────────────────

async function uploadFile(
  bucket,
  key,
  data,
  contentType = "application/octet-stream",
) {
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
      }),
    );
    const url = buildS3Url(bucket, key);
    console.log(`[S3] Uploaded: ${url}`);
    return url;
  } catch (error) {
    console.error("[S3] Upload failed:", error);
    throw error;
  }
}

async function uploadString(bucket, key, content, contentType = "text/plain") {
  return uploadFile(bucket, key, Buffer.from(content), contentType);
}

async function uploadJSON(bucket, key, data) {
  return uploadString(
    bucket,
    key,
    JSON.stringify(data, null, 2),
    "application/json",
  );
}

async function downloadFile(bucket, key, fileName) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${fileName}"`,
    });
    const url = await getSignedUrl(s3, command, {
      expiresIn: SIGNED_URL_EXPIRY_SECONDS,
    });
    console.log(`[S3] Generated download URL for: ${key}`);
    return { url, fileName };
  } catch (error) {
    console.error("[S3] Failed to generate download URL:", error);
    throw error;
  }
}

async function deleteFile(bucket, key) {
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    console.log(`[S3] Deleted: ${key}`);
  } catch (error) {
    console.error("[S3] Delete failed:", error);
    throw error;
  }
}

async function getPresignedUploadUrl(bucket, key, fileSize) {
  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentLength: fileSize,
    });
    const url = await getSignedUrl(s3, command, {
      expiresIn: SIGNED_URL_EXPIRY_SECONDS,
    });
    console.log(`[S3] Generated presigned upload URL for: ${key}`);
    return url;
  } catch (error) {
    console.error("[S3] Failed to generate presigned upload URL:", error);
    throw error;
  }
}

async function archiveLogs(tenantId, logs) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const key = `logs/${tenantId}/${timestamp}.json`;
  return uploadJSON(BUCKETS.workflows, key, {
    tenantId,
    archivedAt: new Date(),
    logCount: logs.length,
    logs,
  });
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const s3Manager = {
  uploadFile,
  uploadString,
  uploadJSON,
  downloadFile,
  deleteFile,
  getPresignedUploadUrl,
  archiveLogs,
  getBucket: () => BUCKETS.workflows,
  buildS3Url,
};

export default s3Manager;
