import taskModel from "../models/taskModel.js";
import AppError from "../../../utils/appError.js";
import { wrapServiceFn } from "../../../utils/serviceWrapper.js";

export const getAllTasks = wrapServiceFn(async (tenantFilter) => {
  return taskModel
    .find(tenantFilter)
    .populate("assignedTo", "firstName lastName email")
    .populate("createdBy", "firstName lastName email")
    .sort({ createdAt: -1 })
    .lean();
});

export const getTaskById = wrapServiceFn(async (id, tenantFilter) => {
  const task = await taskModel
    .findOne({ _id: id, ...tenantFilter })
    .populate("assignedTo", "firstName lastName email")
    .populate("createdBy", "firstName lastName email")
    .lean();
  if (!task) throw new AppError("Task not found", 404);
  return task;
});

export const createTask = wrapServiceFn(async (data) => {
  const task = await taskModel.create(data);
  return taskModel
    .findById(task._id)
    .populate("assignedTo", "firstName lastName email")
    .populate("createdBy", "firstName lastName email")
    .lean();
});

export const updateTask = wrapServiceFn(async (id, tenantFilter, updates, lastKnownUpdatedAt) => {
  const task = await taskModel.findOne({ _id: id, ...tenantFilter });
  if (!task) throw new AppError("Task not found", 404);

  if (lastKnownUpdatedAt) {
    const clientTimestamp = new Date(lastKnownUpdatedAt).getTime();
    const serverTimestamp = new Date(task.updatedAt).getTime();

    if (clientTimestamp !== serverTimestamp) {
      throw new AppError(
        "This task was modified by someone else. Please refresh and try again.",
        409,
      );
    }
  }

  const updatedTask = await taskModel
    .findOneAndUpdate({ _id: id, ...tenantFilter }, updates, { new: true })
    .populate("assignedTo", "firstName lastName email")
    .populate("createdBy", "firstName lastName email")
    .lean();
  return updatedTask;
});

export const deleteTask = wrapServiceFn(async (id, tenantFilter) => {
  const task = await taskModel.findOneAndDelete({ _id: id, ...tenantFilter });
  if (!task) throw new AppError("Task not found", 404);
  return task;
});
