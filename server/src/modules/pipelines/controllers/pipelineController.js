import asyncCatch from "../../../utils/asyncCatch.js";
import * as pipelineService from "../services/pipelineService.js";

export const getAllPipelines = asyncCatch(async (req, res) => {
  const pipelines = await pipelineService.getAllPipelinesForUser(
    req.auth.userId,
  );
  res.json({ count: pipelines.length, pipelines });
});

export const getPipelineById = asyncCatch(async (req, res) => {
  const pipeline = await pipelineService.getPipelineById(
    req.params.id,
    req.auth.userId,
  );
  res.json({ pipeline });
});

export const createPipeline = asyncCatch(async (req, res) => {
  const tenantId =
    req.tenantContext?.scope === "tenant" ? req.tenantContext.tenantId : null;

  const pipeline = await pipelineService.createPipeline({
    ...req.body,
    userId: req.auth.userId,
    tenantId,
    createdBy: req.auth.userId,
  });

  res.status(201).json({ message: "Pipeline created successfully", pipeline });
});

export const updatePipeline = asyncCatch(async (req, res) => {
  const pipeline = await pipelineService.updatePipeline(
    req.params.id,
    req.auth.userId,
    req.body,
  );
  res.json({ message: "Pipeline updated successfully", pipeline });
});

export const deletePipeline = asyncCatch(async (req, res) => {
  await pipelineService.deletePipeline(req.params.id, req.auth.userId);
  res.json({ message: "Pipeline deleted successfully" });
});

export const setDefaultPipeline = asyncCatch(async (req, res) => {
  const pipeline = await pipelineService.setDefaultPipeline(
    req.params.id,
    req.auth.userId,
  );
  res.json({ message: "Default pipeline updated", pipeline });
});
