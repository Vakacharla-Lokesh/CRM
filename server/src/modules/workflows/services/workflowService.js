import workflowModel from "../models/workflowModel.js";
import workflowExecutionLogModel from "../models/workflowExecutionLogModel.js";
import AppError from "../../../utils/appError.js";

export const getAllWorkflows = async (filter, { limit = 20, cursor } = {}) => {
  if (cursor) {
    const lastUpdatedAt = Buffer.from(cursor, "base64").toString("utf8");
    filter.updatedAt = { $lt: new Date(lastUpdatedAt) };
  }

  const workflows = await workflowModel
    .find(filter)
    .populate("createdBy", "firstName lastName email")
    .sort({ updatedAt: -1 })
    .limit(limit + 1);

  const hasNextPage = workflows.length > limit;
  if (hasNextPage) workflows.pop();

  const nextCursor =
    hasNextPage && workflows.length > 0
      ? Buffer.from(
          workflows[workflows.length - 1].updatedAt.toISOString(),
        ).toString("base64")
      : null;

  return { workflows, nextCursor, hasNextPage };
};

export const getWorkflowById = async (id, tenantId, userId, canViewAll) => {
  const workflow = await workflowModel
    .findById(id)
    .populate("createdBy", "firstName lastName email");

  if (!workflow) throw new AppError("Workflow not found", 404);

  if (tenantId && workflow.tenantId.toString() !== tenantId.toString()) {
    throw new AppError("Forbidden: You cannot access this workflow", 403);
  }

  if (!canViewAll && workflow.createdBy._id.toString() !== userId.toString()) {
    throw new AppError("Forbidden: You cannot access this workflow", 403);
  }

  return workflow;
};

export const createWorkflow = async (workflowData) => {
  const workflow = await workflowModel.create(workflowData);

  return workflowModel
    .findById(workflow._id)
    .populate("createdBy", "firstName lastName email");
};

export const updateWorkflow = async (
  id,
  tenantId,
  userId,
  canViewAll,
  updates,
  lastKnownUpdatedAt,
) => {
  const workflow = await workflowModel.findById(id);
  if (!workflow) throw new AppError("Workflow not found", 404);

  if (tenantId && workflow.tenantId.toString() !== tenantId.toString()) {
    throw new AppError("Forbidden: You cannot update this workflow", 403);
  }

  if (!canViewAll && workflow.createdBy.toString() !== userId.toString()) {
    throw new AppError("Forbidden: You cannot update this workflow", 403);
  }

  if (lastKnownUpdatedAt) {
    const clientTimestamp = new Date(lastKnownUpdatedAt).getTime();
    const serverTimestamp = new Date(workflow.updatedAt).getTime();

    if (clientTimestamp !== serverTimestamp) {
      throw new AppError(
        "This workflow was modified by someone else. Please refresh and try again.",
        409,
      );
    }
  }

  return workflowModel
    .findByIdAndUpdate(id, updates, { new: true, runValidators: true })
    .populate("createdBy", "firstName lastName email");
};

export const deleteWorkflow = async (id, tenantId, userId, canViewAll) => {
  const workflow = await workflowModel.findById(id);
  if (!workflow) throw new AppError("Workflow not found", 404);

  if (tenantId && workflow.tenantId.toString() !== tenantId.toString()) {
    throw new AppError("Forbidden: You cannot delete this workflow", 403);
  }

  if (!canViewAll && workflow.createdBy.toString() !== userId.toString()) {
    throw new AppError("Forbidden: You cannot delete this workflow", 403);
  }

  await workflowModel.findByIdAndDelete(id);
};

export const toggleWorkflow = async (id, tenantId, userId, canViewAll, lastKnownUpdatedAt) => {
  const workflow = await workflowModel.findById(id);
  if (!workflow) throw new AppError("Workflow not found", 404);

  if (tenantId && workflow.tenantId.toString() !== tenantId.toString()) {
    throw new AppError("Forbidden: You cannot modify this workflow", 403);
  }

  if (!canViewAll && workflow.createdBy.toString() !== userId.toString()) {
    throw new AppError("Forbidden: You cannot modify this workflow", 403);
  }

  if (lastKnownUpdatedAt) {
    const clientTimestamp = new Date(lastKnownUpdatedAt).getTime();
    const serverTimestamp = new Date(workflow.updatedAt).getTime();
    if (clientTimestamp !== serverTimestamp) {
      throw new AppError(
        "This workflow was modified by someone else. Please refresh and try again.",
        409,
      );
    }
  }

  workflow.isActive = !workflow.isActive;
  await workflow.save();

  return workflow;
};

export const getWorkflowLogs = async (id, tenantId, { limit = 50 } = {}) => {
  const workflow = await workflowModel.findById(id);
  if (!workflow) throw new AppError("Workflow not found", 404);

  if (tenantId && workflow.tenantId.toString() !== tenantId.toString()) {
    throw new AppError("Forbidden", 403);
  }

  return workflowExecutionLogModel
    .find({ workflowId: id })
    .sort({ triggeredAt: -1 })
    .limit(limit);
};
