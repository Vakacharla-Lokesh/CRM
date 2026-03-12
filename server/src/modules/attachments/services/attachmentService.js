import { randomUUID } from "crypto";
import attachmentModel from "../models/attachmentModel.js";
import leadModel from "../../leads/models/leadModel.js";
import { updateLeadScore } from "../../../utils/leadScoreUtils.js";
import AppError from "../../../utils/appError.js";
import { s3Manager } from "../../../services/aws/s3Manager.js";
import { BUCKETS } from "../../../services/aws/initAwsResources.js";
import { wrapServiceFn } from "../../../utils/serviceWrapper.js";

export function toPublic(att) {
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

export const verifyLeadTenantAccess = wrapServiceFn(async (leadId, userRole, userTenantId) => {
  const lead = await leadModel.findById(leadId);
  if (!lead) throw new AppError("Lead not found", 404);

  if (userRole !== "super_admin" && lead.tenantId.toString() !== userTenantId?.toString()) {
    throw new AppError(
      "Forbidden: You cannot access resources from other tenants",
      403,
    );
  }

  return lead;
});

export const getAllAttachments = wrapServiceFn(async () => {
  const attachments = await attachmentModel.find().select("-__v");
  return attachments.map(toPublic);
});

export const getAttachmentById = wrapServiceFn(async (id) => {
  const attachment = await attachmentModel.findById(id);
  if (!attachment) throw new AppError("Attachment not found", 404);
  return attachment;
});

export const getPresignedUploadUrl = wrapServiceFn(async (leadId, fileName, fileSize) => {
  const uuid = randomUUID();
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const s3Key = `attachments/${leadId}/${uuid}-${safeFileName}`;

  const presignedUrl = await s3Manager.getPresignedUploadUrl(
    BUCKETS.leads,
    s3Key,
    fileSize,
  );
  const s3Url = s3Manager.buildS3Url(BUCKETS.leads, s3Key);

  return { presignedUrl, s3Key, s3Url };
});

export const createAttachment = wrapServiceFn(async (attachmentData) => {
  const attachment = await attachmentModel.create(attachmentData);
  await updateLeadScore(attachmentData.leadId);
  return attachment;
});

export const deleteAttachment = wrapServiceFn(async (id) => {
  const attachment = await attachmentModel.findById(id);
  if (!attachment) throw new AppError("Attachment not found", 404);

  await s3Manager.deleteFile(BUCKETS.leads, attachment.s3Key);

  const leadId = attachment.leadId;
  await attachmentModel.findByIdAndDelete(id);
  await updateLeadScore(leadId);

  return { attachment, leadId };
});

export const getAttachmentsByLead = wrapServiceFn(async (leadId) => {
  const attachments = await attachmentModel.find({ leadId });
  return attachments.map(toPublic);
});

export const downloadAttachment = wrapServiceFn(async (id) => {
  const attachment = await attachmentModel.findById(id);
  if (!attachment) throw new AppError("Attachment not found", 404);

  const result = await s3Manager.downloadFile(
    BUCKETS.leads,
    attachment.s3Key,
    attachment.fileName,
  );

  return { url: result.url, fileName: attachment.fileName, attachment };
});
