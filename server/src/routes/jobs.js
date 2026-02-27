import { Router } from "express";
import { getJobStatus } from "../controllers/jobController.js";
import { authenticateRequest } from "../middlewares/auth.js";
import { requirePermission, injectTenantContext } from "../middlewares/rbac.js";

const router = Router();

router.get(
  "/:jobId",
  authenticateRequest,
  requirePermission("settings:read"),
  injectTenantContext,
  getJobStatus,
);

export default router;
