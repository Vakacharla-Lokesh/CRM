import taskModel from "../models/taskModel.js";
import AppError from "../utils/appError.js";

export const getAllTasks = async (tenantFilter) => {
  return taskModel
    .find(tenantFilter)
    .populate("assignedTo", "firstName lastName email")
    .populate("createdBy", "firstName lastName email")
    .sort({ createdAt: -1 })
    .lean();
};

export const getTaskById = async (id, tenantFilter) => {
  const task = await taskModel
    .findOne({ _id: id, ...tenantFilter })
    .populate("assignedTo", "firstName lastName email")
    .populate("createdBy", "firstName lastName email")
    .lean();
  if (!task) throw new AppError("Task not found", 404);
  return task;
};

export const createTask = async (data) => {
  const task = await taskModel.create(data);
  return taskModel
    .findById(task._id)
    .populate("assignedTo", "firstName lastName email")
    .populate("createdBy", "firstName lastName email")
    .lean();
};

export const updateTask = async (id, tenantFilter, updates) => {
  const task = await taskModel
    .findOneAndUpdate({ _id: id, ...tenantFilter }, updates, { new: true })
    .populate("assignedTo", "firstName lastName email")
    .populate("createdBy", "firstName lastName email")
    .lean();
  if (!task) throw new AppError("Task not found", 404);
  return task;
};

export const deleteTask = async (id, tenantFilter) => {
  const task = await taskModel.findOneAndDelete({ _id: id, ...tenantFilter });
  if (!task) throw new AppError("Task not found", 404);
  return task;
};
