import { Router } from "express";
import {
  getUsersStatsController,
  getTenantsStatsController,
} from "../controllers/statsController.js";
import { authenticateRequest } from "../../../middlewares/auth.js";
import {
  requirePermission,
  injectTenantContext,
} from "../../../middlewares/rbac.js";

const router = Router();

const auth = [authenticateRequest, injectTenantContext];

router.get(
  "/users",
  ...auth,
  requirePermission("users:read"),
  getUsersStatsController,
);

router.get(
  "/tenants",
  ...auth,
  requirePermission("tenants:read"),
  getTenantsStatsController,
);

export default router;
