import attachmentModel from "../models/attachmentModel.js";
import leadModel from "../models/leadModel.js";

// Get all attachments
export const getAllAttachments = async (req, res, next) => {
  try {
    const attachments = await attachmentModel.find();

    res.json({
      count: attachments.length,
      attachments,
    });
  } catch (err) {
    next(err);
  }
};

// Get attachment by ID
export const getAttachmentById = async (req, res, next) => {
  try {
    const attachment = await attachmentModel.findById(req.params.id);

    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    res.json({ attachment });
  } catch (err) {
    next(err);
  }
};

// Create a new attachment
export const createAttachment = async (req, res, next) => {
  try {
    // Verify lead exists and belongs to user's tenant
    const lead = await leadModel.findById(req.body.leadId);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Check tenant access
    if (
      req.user.role !== "super_admin" &&
      lead.tenantId !== req.user.tenantId
    ) {
      return res.status(403).json({
        message:
          "Forbidden: You cannot add attachments to leads from other tenants",
      });
    }

    // Convert base64 fileData to Buffer if needed
    const attachmentData = { ...req.body };
    if (typeof req.body.fileData === "string") {
      attachmentData.fileData = Buffer.from(req.body.fileData, "base64");
    }

    const attachment = await attachmentModel.create(attachmentData);

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
  } catch (err) {
    next(err);
  }
};

// Delete attachment
export const deleteAttachment = async (req, res, next) => {
  try {
    const attachment = await attachmentModel.findById(req.params.id);

    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    // Verify lead tenant access
    const lead = await leadModel.findById(attachment.leadId);
    if (
      req.user.role !== "super_admin" &&
      lead.tenantId !== req.user.tenantId
    ) {
      return res.status(403).json({
        message: "Forbidden: You cannot delete this attachment",
      });
    }

    await attachmentModel.findByIdAndDelete(req.params.id);

    res.json({ message: "Attachment deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Get attachments by lead
export const getAttachmentsByLead = async (req, res, next) => {
  try {
    // Verify lead tenant access
    const lead = await leadModel.findById(req.params.leadId);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (
      req.user.role !== "super_admin" &&
      lead.tenantId !== req.user.tenantId
    ) {
      return res.status(403).json({
        message: "Forbidden: You cannot access attachments from other tenants",
      });
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
  } catch (err) {
    next(err);
  }
};

// Download attachment
export const downloadAttachment = async (req, res, next) => {
  try {
    const attachment = await attachmentModel.findById(req.params.id);

    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    // Verify lead tenant access
    const lead = await leadModel.findById(attachment.leadId);
    if (
      req.user.role !== "super_admin" &&
      lead.tenantId !== req.user.tenantId
    ) {
      return res.status(403).json({
        message: "Forbidden: You cannot download this attachment",
      });
    }

    // Set appropriate headers for file download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${attachment.fileName}"`,
    );
    res.setHeader("Content-Type", attachment.fileType);
    res.send(attachment.fileData);
  } catch (err) {
    next(err);
  }
};
