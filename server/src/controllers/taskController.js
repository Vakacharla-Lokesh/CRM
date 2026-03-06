import asyncCatch from "../utils/asyncCatch.js";
import * as taskService from "../services/taskService.js";

export const getAllTasks = asyncCatch(async (req, res) => {
  const userPermissions = req.auth?.permissions ?? [];
  const canViewAll =
    req.auth?.role === "super_admin" ||
    userPermissions.includes("tasks:view_all");

  const filter = canViewAll
    ? req.tenantFilter
    : { ...req.tenantFilter, createdBy: req.auth.userId };

  const tasks = await taskService.getAllTasks(filter);
  res.json({ count: tasks.length, tasks });
});

export const getTaskById = asyncCatch(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id, req.tenantFilter);
  res.json({ task });
});

export const createTask = asyncCatch(async (req, res) => {
  const tenantId =
    req.tenantContext?.scope === "tenant"
      ? req.tenantContext.tenantId
      : req.body.tenantId;

  const task = await taskService.createTask({
    ...req.body,
    tenantId,
    createdBy: req.auth.userId,
  });
  res.status(201).json({ message: "Task created successfully", task });
});

export const updateTask = asyncCatch(async (req, res) => {
  const task = await taskService.updateTask(
    req.params.id,
    req.tenantFilter,
    req.body,
  );
  res.json({ message: "Task updated successfully", task });
});

export const updateTaskStatus = asyncCatch(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.tenantFilter, {
    status: req.body.status,
  });
  res.json({ message: "Task status updated", task });
});

export const deleteTask = asyncCatch(async (req, res) => {
  await taskService.deleteTask(req.params.id, req.tenantFilter);
  res.json({ message: "Task deleted successfully" });
});
