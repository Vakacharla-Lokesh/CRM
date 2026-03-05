import workflowModel from "../models/workflows/workflowModel.js";
import workflowExecutionLogModel from "../models/workflows/workflowExecutionLogModel.js";
import asyncCatch from "../utils/asyncCatch.js";
import AppError from "../utils/appError.js";

export const getAllWorkflows = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    (Array.isArray(req.auth?.permissions) &&
      req.auth.permissions.includes("workflows:view_all"));

  const filter = req.tenantFilter || {};

  if (!canViewAll) {
    filter.createdBy = req.auth.userId;
  }

  const limit = parseInt(req.query.limit) || 20;
  const cursor = req.query.cursor;

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

  res.json({ count: workflows.length, workflows, nextCursor, hasNextPage });
});

export const getWorkflowById = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    (Array.isArray(req.auth?.permissions) &&
      req.auth.permissions.includes("workflows:view_all"));

  const workflow = await workflowModel
    .findById(req.params.id)
    .populate("createdBy", "firstName lastName email");

  if (!workflow) throw new AppError("Workflow not found", 404);

  if (
    req.tenantFilter.tenantId &&
    workflow.tenantId.toString() !== req.tenantFilter.tenantId.toString()
  ) {
    throw new AppError("Forbidden: You cannot access this workflow", 403);
  }

  if (
    !canViewAll &&
    workflow.createdBy._id.toString() !== req.auth.userId.toString()
  ) {
    throw new AppError("Forbidden: You cannot access this workflow", 403);
  }

  res.json({ workflow });
});

export const createWorkflow = asyncCatch(async (req, res) => {
  const workflowData = {
    ...req.body,
    createdBy: req.user.userId,
  };

  if (req.tenantFilter.tenantId) {
    workflowData.tenantId = req.tenantFilter.tenantId;
  }

  const workflow = await workflowModel.create(workflowData);

  const populated = await workflowModel
    .findById(workflow._id)
    .populate("createdBy", "firstName lastName email");

  res
    .status(201)
    .json({ message: "Workflow created successfully", workflow: populated });
});

export const updateWorkflow = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    (Array.isArray(req.auth?.permissions) &&
      req.auth.permissions.includes("workflows:view_all"));

  const workflow = await workflowModel.findById(req.params.id);

  if (!workflow) throw new AppError("Workflow not found", 404);

  if (
    req.tenantFilter.tenantId &&
    workflow.tenantId.toString() !== req.tenantFilter.tenantId.toString()
  ) {
    throw new AppError("Forbidden: You cannot update this workflow", 403);
  }

  if (
    !canViewAll &&
    workflow.createdBy.toString() !== req.auth.userId.toString()
  ) {
    throw new AppError("Forbidden: You cannot update this workflow", 403);
  }

  const updated = await workflowModel
    .findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    .populate("createdBy", "firstName lastName email");

  res.json({ message: "Workflow updated successfully", workflow: updated });
});

export const deleteWorkflow = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    (Array.isArray(req.auth?.permissions) &&
      req.auth.permissions.includes("workflows:view_all"));

  const workflow = await workflowModel.findById(req.params.id);

  if (!workflow) throw new AppError("Workflow not found", 404);

  if (
    req.tenantFilter.tenantId &&
    workflow.tenantId.toString() !== req.tenantFilter.tenantId.toString()
  ) {
    throw new AppError("Forbidden: You cannot delete this workflow", 403);
  }

  if (
    !canViewAll &&
    workflow.createdBy.toString() !== req.auth.userId.toString()
  ) {
    throw new AppError("Forbidden: You cannot delete this workflow", 403);
  }

  await workflowModel.findByIdAndDelete(req.params.id);

  res.json({ message: "Workflow deleted successfully" });
});

export const toggleWorkflow = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    (Array.isArray(req.auth?.permissions) &&
      req.auth.permissions.includes("workflows:view_all"));

  const workflow = await workflowModel.findById(req.params.id);

  if (!workflow) throw new AppError("Workflow not found", 404);

  if (
    req.tenantFilter.tenantId &&
    workflow.tenantId.toString() !== req.tenantFilter.tenantId.toString()
  ) {
    throw new AppError("Forbidden: You cannot modify this workflow", 403);
  }

  if (
    !canViewAll &&
    workflow.createdBy.toString() !== req.auth.userId.toString()
  ) {
    throw new AppError("Forbidden: You cannot modify this workflow", 403);
  }

  workflow.isActive = !workflow.isActive;
  await workflow.save();

  res.json({
    message: `Workflow ${workflow.isActive ? "activated" : "deactivated"}`,
    isActive: workflow.isActive,
  });
});

export const getWorkflowLogs = asyncCatch(async (req, res) => {
  const workflow = await workflowModel.findById(req.params.id);

  if (!workflow) throw new AppError("Workflow not found", 404);

  if (
    req.tenantFilter.tenantId &&
    workflow.tenantId.toString() !== req.tenantFilter.tenantId.toString()
  ) {
    throw new AppError("Forbidden", 403);
  }

  const limit = parseInt(req.query.limit) || 50;

  const logs = await workflowExecutionLogModel
    .find({ workflowId: req.params.id })
    .sort({ triggeredAt: -1 })
    .limit(limit);

  res.json({ count: logs.length, logs });
});
