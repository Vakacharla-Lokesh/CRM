import * as attachmentService from "../services/attachmentService.js";
import asyncCatch from "../../../utils/asyncCatch.js";
import { logActivity } from "../../leads/services/leadActivityService.js";
import { LEAD_ACTIVITY_TYPES } from "../../../utils/leadActivityTypes.js";

export const getAllAttachments = asyncCatch(async (req, res) => {
  const attachments = await attachmentService.getAllAttachments();

  res.json({
    count: attachments.length,
    attachments,
  });
});

export const getAttachmentById = asyncCatch(async (req, res) => {
  const attachment = await attachmentService.getAttachmentById(req.params.id);

  res.json({ attachment: attachmentService.toPublic(attachment) });
});

export const getPresignedUploadUrl = asyncCatch(async (req, res) => {
  const { leadId, fileName, fileType, fileSize } = req.body;

  await attachmentService.verifyLeadTenantAccess(
    leadId,
    req.user.role,
    req.user.tenantId,
  );

  const result = await attachmentService.getPresignedUploadUrl(
    leadId,
    fileName,
    fileSize,
  );

  res.json(result);
});

export const createAttachment = asyncCatch(async (req, res) => {
  const { leadId, fileName, fileType, fileSize, s3Key, s3Url } = req.body;

  const lead = await attachmentService.verifyLeadTenantAccess(
    leadId,
    req.user.role,
    req.user.tenantId,
  );

  const attachment = await attachmentService.createAttachment({
    leadId,
    fileName,
    fileType,
    fileSize,
    s3Key,
    s3Url,
  });

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
    attachment: attachmentService.toPublic(attachment),
  });
});

export const deleteAttachment = asyncCatch(async (req, res) => {
  const existing = await attachmentService.getAttachmentById(req.params.id);

  const lead = await attachmentService.verifyLeadTenantAccess(
    existing.leadId,
    req.user.role,
    req.user.tenantId,
  );

  const { attachment, leadId } = await attachmentService.deleteAttachment(
    req.params.id,
  );

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

export const getAttachmentsByLead = asyncCatch(async (req, res) => {
  await attachmentService.verifyLeadTenantAccess(
    req.params.leadId,
    req.user.role,
    req.user.tenantId,
  );

  const attachments = await attachmentService.getAttachmentsByLead(
    req.params.leadId,
  );

  res.json({
    count: attachments.length,
    attachments,
  });
});

export const downloadAttachment = asyncCatch(async (req, res) => {
  const existing = await attachmentService.getAttachmentById(req.params.id);

  await attachmentService.verifyLeadTenantAccess(
    existing.leadId,
    req.user.role,
    req.user.tenantId,
  );

  const { url, fileName } = await attachmentService.downloadAttachment(
    req.params.id,
  );

  res.json({ url, fileName });
});
