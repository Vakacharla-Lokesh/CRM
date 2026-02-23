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
import { authenticate } from "../middlewares/auth.js";
import { injectTenantFilter } from "../middlewares/rbac.js";
import passport from "../config/passport.js";

const router = Router();

const auth = [authenticate, injectTenantFilter];

router.use(passport.authenticate("jwt", { session: false }));

// Dashboard
// GET /api/analytics/dashboard
router.get("/dashboard", ...auth, getDashboardStats);

// Leads
// GET /api/analytics/leads/trends?days=30
router.get("/leads/trends", ...auth, getLeadTrends);

// GET /api/analytics/leads/status-breakdown?days=30
router.get("/leads/status-breakdown", ...auth, getLeadStatusBreakdown);

// GET /api/analytics/leads/score-distribution
router.get("/leads/score-distribution", ...auth, getLeadScoreDistribution);

// Deals
// GET /api/analytics/deals/pipeline
router.get("/deals/pipeline", ...auth, getDealPipeline);

// GET /api/analytics/deals/trends?days=30
router.get("/deals/trends", ...auth, getDealTrends);

// Organizations
// GET /api/analytics/organizations/stats
router.get("/organizations/stats", ...auth, getOrganizationStats);

// GET /api/analytics/organizations/top?limit=10
router.get("/organizations/top", ...auth, getTopOrganizations);

export default router;
