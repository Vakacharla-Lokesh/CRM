import commentModel from "../models/commentModel.js";
import leadModel from "../models/leadModel.js";
import { updateLeadScore } from "../utils/leadScoreUtils.js";
import asyncCatch from "../utils/asyncCatch.js";
import AppError from "../utils/AppError.js";
import { logActivity } from "../services/leadActivityService.js";
import { LEAD_ACTIVITY_TYPES } from "../utils/leadActivityTypes.js";

// Get all comments
export const getAllComments = asyncCatch(async (req, res) => {
  const comments = await commentModel.find();

  res.json({
    count: comments.length,
    comments,
  });
});

// Get comment by ID
export const getCommentById = asyncCatch(async (req, res) => {
  const comment = await commentModel.findById(req.params.id);

  if (!comment) throw new AppError("Comment not found", 404);

  res.json({ comment });
});

// Create a new comment
export const createComment = asyncCatch(async (req, res) => {
  // Verify lead exists and belongs to user's tenant
  const lead = await leadModel.findById(req.body.leadId);

  if (!lead) throw new AppError("Lead not found", 404);

  // Check tenant access
  if (
    req.user.role !== "super_admin" &&
    lead.tenantId.toString() !== req.user.tenantId
  ) {
    throw new AppError(
      "Forbidden: You cannot add comments to leads from other tenants",
      403,
    );
  }

  const comment = await commentModel.create(req.body);

  // Update lead score after adding comment
  await updateLeadScore(req.body.leadId);

  await logActivity({
    leadId: req.body.leadId,
    tenantId: lead.tenantId,
    type: LEAD_ACTIVITY_TYPES.COMMENT_ADDED,
    description: `Comment "${comment.title}" was added`,
    metadata: { commentId: comment._id },
    userId: req.user.userId,
  });

  res.status(201).json({
    message: "Comment created successfully",
    comment,
  });
});

// Update comment
export const updateComment = asyncCatch(async (req, res) => {
  const comment = await commentModel.findById(req.params.id);

  if (!comment) throw new AppError("Comment not found", 404);

  // Verify lead tenant access
  const lead = await leadModel.findById(comment.leadId);
  if (
    req.user.role !== "super_admin" &&
    lead.tenantId.toString() !== req.user.tenantId
  ) {
    throw new AppError("Forbidden: You cannot update this comment", 403);
  }

  const updatedComment = await commentModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );

  res.json({
    message: "Comment updated successfully",
    comment: updatedComment,
  });
});

// Delete comment
export const deleteComment = asyncCatch(async (req, res) => {
  const comment = await commentModel.findById(req.params.id);

  if (!comment) throw new AppError("Comment not found", 404);

  // Verify lead tenant access
  const lead = await leadModel.findById(comment.leadId);
  if (
    req.user.role !== "super_admin" &&
    lead.tenantId.toString() !== req.user.tenantId
  ) {
    throw new AppError("Forbidden: You cannot delete this comment", 403);
  }

  const leadId = comment.leadId;
  await commentModel.findByIdAndDelete(req.params.id);

  // Update lead score after deleting comment
  await updateLeadScore(leadId);

  await logActivity({
    leadId,
    tenantId: lead.tenantId,
    type: LEAD_ACTIVITY_TYPES.COMMENT_DELETED,
    description: `Comment "${comment.title}" was deleted`,
    metadata: { commentId: req.params.id },
    userId: req.user.userId,
  });

  res.json({ message: "Comment deleted successfully" });
});

// Get comments by lead
export const getCommentsByLead = asyncCatch(async (req, res) => {
  // Verify lead tenant access
  const lead = await leadModel.findById(req.params.leadId);

  if (!lead) throw new AppError("Lead not found", 404);

  if (
    req.user.role !== "super_admin" &&
    lead.tenantId.toString() !== req.user.tenantId
  ) {
    throw new AppError(
      "Forbidden: You cannot access comments from other tenants",
      403,
    );
  }

  const comments = await commentModel.find({ leadId: req.params.leadId });

  res.json({
    count: comments.length,
    comments,
  });
});
