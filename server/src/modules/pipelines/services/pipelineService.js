import pipelineModel from "../models/pipelineModel.js";
import AppError from "../../../utils/appError.js";
import mongoose from "mongoose";
import { wrapServiceFn } from "../../../utils/serviceWrapper.js";

export const DEFAULT_SALES_PIPELINE_STATUSES = [
  { label: "New", color: "#3b82f6", order: 0 },
  { label: "Follow-Up", color: "#f59e0b", order: 1 },
  { label: "Dead", color: "#ef4444", order: 2 },
  { label: "Converted", color: "#10b981", order: 3 },
];

export const seedDefaultPipeline = wrapServiceFn(async (userId, tenantId) => {
  const existing = await pipelineModel.findOne({ userId, isDefault: true });
  if (existing) return existing;

  return pipelineModel.create({
    userId,
    tenantId,
    name: "Sales Pipeline",
    isDefault: true,
    statuses: DEFAULT_SALES_PIPELINE_STATUSES,
    createdBy: userId,
  });
});

export const getDefaultPipeline = wrapServiceFn(async (userId) => {
  const pipeline = await pipelineModel
    .findOne({ userId, isDefault: true })
    .lean();
  if (pipeline) return pipeline;

  const fallback = await pipelineModel
    .findOne({ userId })
    .sort({ createdAt: 1 })
    .lean();
  return fallback ?? null;
});

export const getAllPipelinesForUser = wrapServiceFn(async (userId) => {
  return pipelineModel
    .find({ userId })
    .sort({ isDefault: -1, createdAt: 1 })
    .lean();
});

export const getPipelineById = wrapServiceFn(async (id, userId) => {
  const pipeline = await pipelineModel.findOne({ _id: id, userId }).lean();
  if (!pipeline) throw new AppError("Pipeline not found", 404);
  return pipeline;
});

export const createPipeline = wrapServiceFn(async (data) => {
  const labels = data.statuses.map((s) => s.label.toLowerCase());
  const uniqueLabels = new Set(labels);
  if (labels.length !== uniqueLabels.size) {
    throw new AppError("Pipeline stages must have unique labels", 400);
  }

  return pipelineModel.create(data);
});

export const updatePipeline = wrapServiceFn(async (id, userId, updates) => {
  const pipeline = await pipelineModel.findOne({ _id: id, userId });
  if (!pipeline) throw new AppError("Pipeline not found", 404);

  if (updates.statuses) {
    const labels = updates.statuses.map((s) => s.label.toLowerCase());
    const uniqueLabels = new Set(labels);
    if (labels.length !== uniqueLabels.size) {
      throw new AppError("Pipeline stages must have unique labels", 400);
    }
  }

  const updated = await pipelineModel
    .findOneAndUpdate({ _id: id, userId }, updates, {
      new: true,
      runValidators: true,
    })
    .lean();

  return updated;
});

export const deletePipeline = wrapServiceFn(async (id, userId) => {
  const pipeline = await pipelineModel.findOne({ _id: id, userId });
  if (!pipeline) throw new AppError("Pipeline not found", 404);

  if (pipeline.isDefault) {
    throw new AppError("Cannot delete the default pipeline", 400);
  }

  const defaultPipeline = await getDefaultPipeline(userId);
  if (defaultPipeline) {
    const leadModel = (await import("../models/leadModel.js")).default;
    await leadModel.updateMany(
      { pipelineId: new mongoose.Types.ObjectId(id) },
      { pipelineId: defaultPipeline._id },
    );
  }

  await pipelineModel.findOneAndDelete({ _id: id, userId });
  return pipeline;
});

export const setDefaultPipeline = wrapServiceFn(async (id, userId) => {
  const pipeline = await pipelineModel.findOne({ _id: id, userId });
  if (!pipeline) throw new AppError("Pipeline not found", 404);

  if (pipeline.isDefault) return pipeline.toObject();

  await pipelineModel.updateMany(
    { userId, isDefault: true },
    { isDefault: false },
  );
  const updated = await pipelineModel
    .findOneAndUpdate({ _id: id, userId }, { isDefault: true }, { new: true })
    .lean();

  return updated;
});

export const validateStatusInPipeline = wrapServiceFn(async (pipelineId, statusLabel) => {
  const pipeline = await pipelineModel.findById(pipelineId).lean();
  if (!pipeline) throw new AppError("Pipeline not found", 404);

  const valid = pipeline.statuses.some(
    (s) => s.label.toLowerCase() === statusLabel.toLowerCase(),
  );

  if (!valid) {
    const allowed = pipeline.statuses.map((s) => s.label).join(", ");
    throw new AppError(
      `Invalid status "${statusLabel}" for this pipeline. Allowed: ${allowed}`,
      400,
    );
  }

  return pipeline;
});
