import { Router } from "express";
import {
  getDashboardStats,
  getLeadTrends,
  getLeadStatusBreakdown,
  getLeadScoreDistribution,
  getDealPipeline,
  getDealTrends,
  getOrganizationStats,
  getTopOrganizations,
} from "../controllers/analyticsController.js";
import { triggerAnalyticsSnapshot } from "../controllers/analyticsSnapshotController.js";
import { authenticateRequest } from "../../../middlewares/auth.js";
import { requirePermission, injectTenantContext } from "../../../middlewares/rbac.js";

const router = Router();

const auth = [
  authenticateRequest,
  requirePermission("analytics:read"),
  injectTenantContext,
];

const superAdminOnly = [
  authenticateRequest,
  requirePermission("system:manage"),
];

router.get("/dashboard", ...auth, getDashboardStats);
router.get("/leads/trends", ...auth, getLeadTrends);
router.get("/leads/status-breakdown", ...auth, getLeadStatusBreakdown);
router.get("/leads/score-distribution", ...auth, getLeadScoreDistribution);
router.get("/deals/pipeline", ...auth, getDealPipeline);
router.get("/deals/trends", ...auth, getDealTrends);
router.get("/organizations/stats", ...auth, getOrganizationStats);
router.get("/organizations/top", ...auth, getTopOrganizations);

router.post("/snapshot/trigger", ...superAdminOnly, triggerAnalyticsSnapshot);

export default router;
