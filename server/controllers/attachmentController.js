import attachmentModel from "../models/attachmentModel.js";
import leadModel from "../models/leadModel.js";
import { updateLeadScore } from "../utils/leadScoreUtils.js";
import asyncCatch from "../utils/asyncCatch.js";
import AppError from "../utils/AppError.js";

// Get all attachments
export const getAllAttachments = asyncCatch(async (req, res) => {
  const attachments = await attachmentModel.find();

  res.json({
    count: attachments.length,
    attachments,
  });
});

// Get attachment by ID
export const getAttachmentById = asyncCatch(async (req, res) => {
  const attachment = await attachmentModel.findById(req.params.id);

  if (!attachment) throw new AppError("Attachment not found", 404);

  res.json({ attachment });
});

// Create a new attachment
export const createAttachment = asyncCatch(async (req, res) => {
  // Verify lead exists and belongs to user's tenant
  const lead = await leadModel.findById(req.body.leadId);

  if (!lead) throw new AppError("Lead not found", 404);

  // Check tenant access
  if (
    req.user.role !== "super_admin" &&
    lead.tenantId.toString() !== req.user.tenantId
  ) {
    throw new AppError(
      "Forbidden: You cannot add attachments to leads from other tenants",
      403,
    );
  }

  // Convert base64 fileData to Buffer if needed
  const attachmentData = { ...req.body };
  if (typeof req.body.fileData === "string") {
    attachmentData.fileData = Buffer.from(req.body.fileData, "base64");
  }

  const attachment = await attachmentModel.create(attachmentData);

  // Update lead score after adding attachment
  await updateLeadScore(req.body.leadId);

  res.status(201).json({
    message: "Attachment created successfully",
    attachment: {
      _id: attachment._id,
      leadId: attachment.leadId,
      fileName: attachment.fileName,
      fileSize: attachment.fileSize,
      fileType: attachment.fileType,
      createdAt: attachment.createdAt,
      updatedAt: attachment.updatedAt,
    },
  });
});

// Delete attachment
export const deleteAttachment = asyncCatch(async (req, res) => {
  const attachment = await attachmentModel.findById(req.params.id);

  if (!attachment) throw new AppError("Attachment not found", 404);

  // Verify lead tenant access
  const lead = await leadModel.findById(attachment.leadId);
  if (
    req.user.role !== "super_admin" &&
    lead.tenantId.toString() !== req.user.tenantId
  ) {
    throw new AppError("Forbidden: You cannot delete this attachment", 403);
  }

  const leadId = attachment.leadId;
  await attachmentModel.findByIdAndDelete(req.params.id);

  // Update lead score after deleting attachment
  await updateLeadScore(leadId);

  res.json({ message: "Attachment deleted successfully" });
});

// Get attachments by lead
export const getAttachmentsByLead = asyncCatch(async (req, res) => {
  // Verify lead tenant access
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

  // Return attachments without binary data for list view
  const attachmentsList = attachments.map((att) => ({
    _id: att._id,
    leadId: att.leadId,
    fileName: att.fileName,
    fileSize: att.fileSize,
    fileType: att.fileType,
    createdAt: att.createdAt,
    updatedAt: att.updatedAt,
  }));

  res.json({
    count: attachmentsList.length,
    attachments: attachmentsList,
  });
});

// Download attachment
export const downloadAttachment = asyncCatch(async (req, res) => {
  const attachment = await attachmentModel.findById(req.params.id);

  if (!attachment) throw new AppError("Attachment not found", 404);

  // Verify lead tenant access
  const lead = await leadModel.findById(attachment.leadId);
  if (
    req.user.role !== "super_admin" &&
    lead.tenantId.toString() !== req.user.tenantId
  ) {
    throw new AppError("Forbidden: You cannot download this attachment", 403);
  }

  // Set appropriate headers for file download
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${attachment.fileName}"`,
  );
  res.setHeader("Content-Type", attachment.fileType);
  res.send(attachment.fileData);
});
