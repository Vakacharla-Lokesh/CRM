import * as commentService from "../services/commentService.js";
import asyncCatch from "../../../utils/asyncCatch.js";
import { logActivity } from "../../leads/services/leadActivityService.js";
import { LEAD_ACTIVITY_TYPES } from "../../../utils/leadActivityTypes.js";

// Get all comments
export const getAllComments = asyncCatch(async (req, res) => {
  const comments = await commentService.getAllComments();

  res.json({
    count: comments.length,
    comments,
  });
});

// Get comment by ID
export const getCommentById = asyncCatch(async (req, res) => {
  const comment = await commentService.getCommentById(req.params.id);

  res.json({ comment });
});

// Create a new comment
export const createComment = asyncCatch(async (req, res) => {
  const lead = await commentService.verifyLeadTenantAccess(
    req.body.leadId,
    req.user.role,
    req.user.tenantId,
  );

  const comment = await commentService.createComment(req.body, req.body.leadId);

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
  const existing = await commentService.getCommentById(req.params.id);

  await commentService.verifyLeadTenantAccess(
    existing.leadId,
    req.user.role,
    req.user.tenantId,
  );

  const { lastKnownUpdatedAt, ...updates } = req.body;
  const { updatedComment } = await commentService.updateComment(
    req.params.id,
    updates,
    lastKnownUpdatedAt,
  );

  res.json({
    message: "Comment updated successfully",
    comment: updatedComment,
  });
});

// Delete comment
export const deleteComment = asyncCatch(async (req, res) => {
  const existing = await commentService.getCommentById(req.params.id);

  const lead = await commentService.verifyLeadTenantAccess(
    existing.leadId,
    req.user.role,
    req.user.tenantId,
  );

  const { comment, leadId } = await commentService.deleteComment(req.params.id);

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
  await commentService.verifyLeadTenantAccess(
    req.params.leadId,
    req.user.role,
    req.user.tenantId,
  );

  const comments = await commentService.getCommentsByLead(req.params.leadId);

  res.json({
    count: comments.length,
    comments,
  });
});
