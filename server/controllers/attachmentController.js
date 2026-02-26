import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

import attachmentModel from "../models/attachmentModel.js";
import leadModel from "../models/leadModel.js";
import { updateLeadScore } from "../utils/leadScoreUtils.js";
import asyncCatch from "../utils/asyncCatch.js";
import AppError from "../utils/AppError.js";
import { s3 } from "../config/awsClient.js";
import { logActivity } from "../services/leadActivityService.js";
import { LEAD_ACTIVITY_TYPES } from "../utils/leadActivityTypes.js";

const S3_BUCKET = "crm-leads";
const LOCALSTACK_ENDPOINT = "http://localhost:4566";

const buildBaseS3Url = (key) => `${LOCALSTACK_ENDPOINT}/${S3_BUCKET}/${key}`;

function toPublic(att) {
  return {
    _id: att._id,
    leadId: att.leadId,
    fileName: att.fileName,
    fileSize: att.fileSize,
    fileType: att.fileType,
    s3Key: att.s3Key,
    s3Url: att.s3Url,
    createdAt: att.createdAt,
    updatedAt: att.updatedAt,
  };
}

// GET /attachments — list all (admin use)
export const getAllAttachments = asyncCatch(async (req, res) => {
  const attachments = await attachmentModel.find().select("-__v");

  res.json({
    count: attachments.length,
    attachments: attachments.map(toPublic),
  });
});

// GET /attachments/:id
export const getAttachmentById = asyncCatch(async (req, res) => {
  const attachment = await attachmentModel.findById(req.params.id);

  if (!attachment) throw new AppError("Attachment not found", 404);

  res.json({ attachment: toPublic(attachment) });
});

// POST /attachments/presigned-url
// Body: { leadId, fileName, fileType, fileSize }
// Returns a pre-signed PUT URL so the client can upload directly to S3.
export const getPresignedUploadUrl = asyncCatch(async (req, res) => {
  const { leadId, fileName, fileType, fileSize } = req.body;

  const lead = await leadModel.findById(leadId);
  if (!lead) throw new AppError("Lead not found", 404);

  if (
    req.user.role !== "super_admin" &&
    lead.tenantId.toString() !== req.user.tenantId
  ) {
    throw new AppError(
      "Forbidden: You cannot upload attachments to leads from other tenants",
      403,
    );
  }

  const uuid = randomUUID();
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const s3Key = `attachments/${leadId}/${uuid}-${safeFileName}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
    ContentType: fileType,
    ContentLength: fileSize,
  });

  // Presigned PUT URL valid for 5 minutes
  const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  const s3Url = buildBaseS3Url(s3Key);

  res.json({ presignedUrl, s3Key, s3Url });
});

// POST /attachments
// Body: { leadId, fileName, fileType, fileSize, s3Key, s3Url }
// Called AFTER the client has uploaded the file to S3 via presigned URL.
export const createAttachment = asyncCatch(async (req, res) => {
  const { leadId, fileName, fileType, fileSize, s3Key, s3Url } = req.body;

  const lead = await leadModel.findById(leadId);
  if (!lead) throw new AppError("Lead not found", 404);

  if (
    req.user.role !== "super_admin" &&
    lead.tenantId.toString() !== req.user.tenantId
  ) {
    throw new AppError(
      "Forbidden: You cannot add attachments to leads from other tenants",
      403,
    );
  }

  const attachment = await attachmentModel.create({
    leadId,
    fileName,
    fileType,
    fileSize,
    s3Key,
    s3Url,
  });

  await updateLeadScore(leadId);

  await logActivity({
    leadId,
    tenantId: lead.tenantId,
    type: LEAD_ACTIVITY_TYPES.ATTACHMENT_ADDED,
    description: `File "${fileName}" was attached`,
    metadata: { attachmentId: attachment._id, fileName, fileType, fileSize },
    userId: req.user.userId,
  });

  res.status(201).json({
    message: "Attachment created successfully",
    attachment: toPublic(attachment),
  });
});

// DELETE /attachments/:id — removes the DB record and the S3 object
export const deleteAttachment = asyncCatch(async (req, res) => {
  const attachment = await attachmentModel.findById(req.params.id);

  if (!attachment) throw new AppError("Attachment not found", 404);

  const lead = await leadModel.findById(attachment.leadId);
  if (
    req.user.role !== "super_admin" &&
    lead.tenantId.toString() !== req.user.tenantId
  ) {
    throw new AppError("Forbidden: You cannot delete this attachment", 403);
  }

  // Remove the object from S3
  await s3.send(
    new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: attachment.s3Key }),
  );

  const leadId = attachment.leadId;
  await attachmentModel.findByIdAndDelete(req.params.id);

  await updateLeadScore(leadId);

  await logActivity({
    leadId,
    tenantId: lead.tenantId,
    type: LEAD_ACTIVITY_TYPES.ATTACHMENT_REMOVED,
    description: `File "${attachment.fileName}" was removed`,
    metadata: { attachmentId: req.params.id, fileName: attachment.fileName },
    userId: req.user.userId,
  });

  res.json({ message: "Attachment deleted successfully" });
});

// GET /attachments/lead/:leadId
export const getAttachmentsByLead = asyncCatch(async (req, res) => {
  const lead = await leadModel.findById(req.params.leadId);

  if (!lead) throw new AppError("Lead not found", 404);

  if (
    req.user.role !== "super_admin" &&
    lead.tenantId.toString() !== req.user.tenantId
  ) {
    throw new AppError(
      "Forbidden: You cannot access attachments from other tenants",
      403,
    );
  }

  const attachments = await attachmentModel.find({
    leadId: req.params.leadId,
  });

  res.json({
    count: attachments.length,
    attachments: attachments.map(toPublic),
  });
});

// GET /attachments/:id/download
// Returns a fresh presigned GET URL (valid 5 min) the client uses directly.
export const downloadAttachment = asyncCatch(async (req, res) => {
  const attachment = await attachmentModel.findById(req.params.id);

  if (!attachment) throw new AppError("Attachment not found", 404);

  const lead = await leadModel.findById(attachment.leadId);
  if (
    req.user.role !== "super_admin" &&
    lead.tenantId.toString() !== req.user.tenantId
  ) {
    throw new AppError("Forbidden: You cannot download this attachment", 403);
  }

  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: attachment.s3Key,
    ResponseContentDisposition: `attachment; filename="${attachment.fileName}"`,
  });

  // Presigned GET URL valid for 5 minutes
  const url = await getSignedUrl(s3, command, { expiresIn: 300 });

  res.json({ url, fileName: attachment.fileName });
});
