import commentModel from "../models/commentModel.js";
import leadModel from "../models/leadModel.js";
import { updateLeadScore } from "../utils/leadScoreUtils.js";
import AppError from "../utils/appError.js";

export const getAllComments = async () => {
  return commentModel.find();
};

export const getCommentById = async (id) => {
  const comment = await commentModel.findById(id);
  if (!comment) throw new AppError("Comment not found", 404);
  return comment;
};

export const verifyLeadTenantAccess = async (leadId, userRole, userTenantId) => {
  const lead = await leadModel.findById(leadId);
  if (!lead) throw new AppError("Lead not found", 404);

  if (userRole !== "super_admin" && lead.tenantId.toString() !== userTenantId?.toString()) {
    throw new AppError(
      "Forbidden: You cannot access resources from other tenants",
      403,
    );
  }

  return lead;
};

export const createComment = async (commentData, leadId) => {
  const comment = await commentModel.create(commentData);
  await updateLeadScore(leadId);
  return comment;
};

export const updateComment = async (id, updates) => {
  const comment = await commentModel.findById(id);
  if (!comment) throw new AppError("Comment not found", 404);

  const updatedComment = await commentModel.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  return { updatedComment, leadId: comment.leadId };
};

export const deleteComment = async (id) => {
  const comment = await commentModel.findById(id);
  if (!comment) throw new AppError("Comment not found", 404);

  const leadId = comment.leadId;
  await commentModel.findByIdAndDelete(id);
  await updateLeadScore(leadId);

  return { comment, leadId };
};

export const getCommentsByLead = async (leadId) => {
  return commentModel.find({ leadId });
};
