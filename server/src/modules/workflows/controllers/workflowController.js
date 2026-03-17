import * as workflowService from "../services/workflowService.js";
import asyncCatch from "../../../utils/asyncCatch.js";

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

  const { workflows, nextCursor, hasNextPage } =
    await workflowService.getAllWorkflows(filter, { limit, cursor });

  res.json({ count: workflows.length, workflows, nextCursor, hasNextPage });
});

export const getWorkflowById = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    (Array.isArray(req.auth?.permissions) &&
      req.auth.permissions.includes("workflows:view_all"));

  const tenantId = req.tenantFilter?.tenantId;

  const workflow = await workflowService.getWorkflowById(
    req.params.id,
    tenantId,
    req.auth.userId,
    canViewAll,
  );

  res.json({ workflow });
});

export const createWorkflow = asyncCatch(async (req, res) => {
  const workflowData = {
    ...req.body,
    createdBy: req.user.userId,
  };

  if (req.tenantFilter?.tenantId) {
    workflowData.tenantId = req.tenantFilter.tenantId;
  }

  const workflow = await workflowService.createWorkflow(workflowData);

  res
    .status(201)
    .json({ message: "Workflow created successfully", workflow });
});

export const updateWorkflow = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    (Array.isArray(req.auth?.permissions) &&
      req.auth.permissions.includes("workflows:view_all"));

  const tenantId = req.tenantFilter?.tenantId;

  const { lastKnownUpdatedAt, ...updates } = req.body;
  const updated = await workflowService.updateWorkflow(
    req.params.id,
    tenantId,
    req.auth.userId,
    canViewAll,
    updates,
    lastKnownUpdatedAt,
  );

  res.json({ message: "Workflow updated successfully", workflow: updated });
});

export const deleteWorkflow = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    (Array.isArray(req.auth?.permissions) &&
      req.auth.permissions.includes("workflows:view_all"));

  const tenantId = req.tenantFilter?.tenantId;

  await workflowService.deleteWorkflow(
    req.params.id,
    tenantId,
    req.auth.userId,
    canViewAll,
  );

  res.json({ message: "Workflow deleted successfully" });
});

export const toggleWorkflow = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    (Array.isArray(req.auth?.permissions) &&
      req.auth.permissions.includes("workflows:view_all"));

  const tenantId = req.tenantFilter?.tenantId;
  const { lastKnownUpdatedAt } = req.body || {};

  const workflow = await workflowService.toggleWorkflow(
    req.params.id,
    tenantId,
    req.auth.userId,
    canViewAll,
    lastKnownUpdatedAt,
  );

  res.json({
    message: `Workflow ${workflow.isActive ? "activated" : "deactivated"}`,
    isActive: workflow.isActive,
  });
});

export const getWorkflowLogs = asyncCatch(async (req, res) => {
  const tenantId = req.tenantFilter?.tenantId;
  const limit = parseInt(req.query.limit) || 50;

  const logs = await workflowService.getWorkflowLogs(
    req.params.id,
    tenantId,
    { limit },
  );

  res.json({ count: logs.length, logs });
});
