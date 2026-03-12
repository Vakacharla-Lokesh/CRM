import commentModel from "../models/commentModel.js";
import leadModel from "../../leads/models/leadModel.js";
import { updateLeadScore } from "../../../utils/leadScoreUtils.js";
import AppError from "../../../utils/appError.js";
import { wrapServiceFn } from "../../../utils/serviceWrapper.js";

export const getAllComments = wrapServiceFn(async () => {
  return commentModel.find();
});

export const getCommentById = wrapServiceFn(async (id) => {
  const comment = await commentModel.findById(id);
  if (!comment) throw new AppError("Comment not found", 404);
  return comment;
});

export const verifyLeadTenantAccess = wrapServiceFn(
  async (leadId, userRole, userTenantId) => {
    const lead = await leadModel.findById(leadId);
    if (!lead) throw new AppError("Lead not found", 404);

    if (
      userRole !== "super_admin" &&
      lead.tenantId.toString() !== userTenantId?.toString()
    ) {
      throw new AppError(
        "Forbidden: You cannot access resources from other tenants",
        403,
      );
    }

    return lead;
  },
);

export const createComment = wrapServiceFn(async (commentData, leadId) => {
  const comment = await commentModel.create(commentData);
  await updateLeadScore(leadId);
  return comment;
});

export const updateComment = wrapServiceFn(
  async (id, updates, lastKnownUpdatedAt) => {
    const comment = await commentModel.findById(id);
    if (!comment) throw new AppError("Comment not found", 404);

    if (lastKnownUpdatedAt) {
      const clientTimestamp = new Date(lastKnownUpdatedAt).getTime();
      const serverTimestamp = new Date(comment.updatedAt).getTime();

      if (clientTimestamp !== serverTimestamp) {
        throw new AppError(
          "This comment was modified by someone else. Please refresh and try again.",
          409,
        );
      }
    }

    const updatedComment = await commentModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    return { updatedComment, leadId: comment.leadId };
  },
);

export const deleteComment = wrapServiceFn(async (id) => {
  const comment = await commentModel.findById(id);
  if (!comment) throw new AppError("Comment not found", 404);

  const leadId = comment.leadId;
  await commentModel.findByIdAndDelete(id);
  await updateLeadScore(leadId);

  return { comment, leadId };
});

export const getCommentsByLead = wrapServiceFn(async (leadId) => {
  return commentModel.find({ leadId });
});
