import { Router } from "express";
import {
  getAllPipelines,
  getPipelineById,
  createPipeline,
  updatePipeline,
  deletePipeline,
  setDefaultPipeline,
} from "../controllers/pipelineController.js";
import { validate } from "../../../middlewares/validate.js";
import { authenticateRequest } from "../../../middlewares/auth.js";
import { requirePermission, injectTenantContext } from "../../../middlewares/rbac.js";
import {
  createPipelineSchema,
  updatePipelineSchema,
} from "../validators/pipelineValidator.js";

const router = Router();

router.get(
  "/",
  authenticateRequest,
  requirePermission("pipelines:read"),
  injectTenantContext,
  getAllPipelines,
);

router.get(
  "/:id",
  authenticateRequest,
  requirePermission("pipelines:read"),
  injectTenantContext,
  getPipelineById,
);

router.post(
  "/",
  authenticateRequest,
  requirePermission("pipelines:write"),
  injectTenantContext,
  validate(createPipelineSchema),
  createPipeline,
);

router.put(
  "/:id",
  authenticateRequest,
  requirePermission("pipelines:write"),
  injectTenantContext,
  validate(updatePipelineSchema),
  updatePipeline,
);

router.delete(
  "/:id",
  authenticateRequest,
  requirePermission("pipelines:delete"),
  injectTenantContext,
  deletePipeline,
);

router.patch(
  "/:id/set-default",
  authenticateRequest,
  requirePermission("pipelines:write"),
  injectTenantContext,
  setDefaultPipeline,
);

export default router;
