import workflowModel from "../models/workflows/workflowModel.js";
import workflowExecutionLogModel from "../models/workflows/workflowExecutionLogModel.js";
import asyncCatch from "../utils/asyncCatch.js";
import AppError from "../utils/AppError.js";

/**
 * GET /api/workflows
 * List all workflows for the tenant (cursor-paginated)
 */
export const getAllWorkflows = asyncCatch(async (req, res) => {
  const filter = req.tenantFilter || {};

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

/**
 * GET /api/workflows/:id
 */
export const getWorkflowById = asyncCatch(async (req, res) => {
  const workflow = await workflowModel
    .findById(req.params.id)
    .populate("createdBy", "firstName lastName email");

  if (!workflow) throw new AppError("Workflow not found", 404);

  if (
    req.user.role !== "super_admin" &&
    workflow.tenantId.toString() !== req.user.tenantId.toString()
  ) {
    throw new AppError("Forbidden: You cannot access this workflow", 403);
  }

  res.json({ workflow });
});

/**
 * POST /api/workflows
 */
export const createWorkflow = asyncCatch(async (req, res) => {
  const workflowData = {
    ...req.body,
    createdBy: req.user.userId,
  };

  if (req.user.role !== "super_admin") {
    workflowData.tenantId = req.user.tenantId;
  }

  const workflow = await workflowModel.create(workflowData);

  const populated = await workflowModel
    .findById(workflow._id)
    .populate("createdBy", "firstName lastName email");

  res
    .status(201)
    .json({ message: "Workflow created successfully", workflow: populated });
});

/**
 * PUT /api/workflows/:id
 */
export const updateWorkflow = asyncCatch(async (req, res) => {
  const workflow = await workflowModel.findById(req.params.id);

  if (!workflow) throw new AppError("Workflow not found", 404);

  if (
    req.user.role !== "super_admin" &&
    workflow.tenantId.toString() !== req.user.tenantId.toString()
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

/**
 * DELETE /api/workflows/:id
 */
export const deleteWorkflow = asyncCatch(async (req, res) => {
  const workflow = await workflowModel.findById(req.params.id);

  if (!workflow) throw new AppError("Workflow not found", 404);

  if (
    req.user.role !== "super_admin" &&
    workflow.tenantId.toString() !== req.user.tenantId.toString()
  ) {
    throw new AppError("Forbidden: You cannot delete this workflow", 403);
  }

  await workflowModel.findByIdAndDelete(req.params.id);

  res.json({ message: "Workflow deleted successfully" });
});

/**
 * PATCH /api/workflows/:id/toggle
 * Toggle isActive status
 */
export const toggleWorkflow = asyncCatch(async (req, res) => {
  const workflow = await workflowModel.findById(req.params.id);

  if (!workflow) throw new AppError("Workflow not found", 404);

  if (
    req.user.role !== "super_admin" &&
    workflow.tenantId.toString() !== req.user.tenantId.toString()
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

/**
 * GET /api/workflows/:id/logs
 * Execution logs for a specific workflow (latest 50)
 */
export const getWorkflowLogs = asyncCatch(async (req, res) => {
  const workflow = await workflowModel.findById(req.params.id);

  if (!workflow) throw new AppError("Workflow not found", 404);

  if (
    req.user.role !== "super_admin" &&
    workflow.tenantId.toString() !== req.user.tenantId.toString()
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
