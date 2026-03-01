import { Router } from "express";
import {
  getUsersStatsController,
  getTenantsStatsController,
} from "../controllers/statsController.js";
import { authenticateRequest } from "../middlewares/auth.js";
import { requirePermission, injectTenantContext } from "../middlewares/rbac.js";

const router = Router();

const auth = [authenticateRequest, injectTenantContext];

// GET /api/stats/users — users aggregate stats
router.get(
  "/users",
  ...auth,
  requirePermission("users:read"),
  getUsersStatsController,
);

// GET /api/stats/tenants — tenants aggregate stats (super admin only)
router.get(
  "/tenants",
  ...auth,
  requirePermission("tenants:read"),
  getTenantsStatsController,
);

export default router;
