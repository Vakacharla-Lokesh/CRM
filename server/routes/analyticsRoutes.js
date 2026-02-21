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

const router = Router();

const auth = [authenticate, injectTenantFilter];

// ── Dashboard ──────────────────────────────────────────────────────────────
// GET /api/analytics/dashboard
// Returns: stats, changes (% vs prev period), period info
router.get("/dashboard", ...auth, getDashboardStats);

// ── Leads ──────────────────────────────────────────────────────────────────
// GET /api/analytics/leads/trends?days=30
// Returns: daily lead counts broken down by status
router.get("/leads/trends", ...auth, getLeadTrends);

// GET /api/analytics/leads/status-breakdown?days=30
// Returns: per-status count, avg score, percentage of total
router.get("/leads/status-breakdown", ...auth, getLeadStatusBreakdown);

// GET /api/analytics/leads/score-distribution
// Returns: bucketed score ranges (0-19, 20-39, etc.) with converted count
router.get("/leads/score-distribution", ...auth, getLeadScoreDistribution);

// ── Deals ──────────────────────────────────────────────────────────────────
// GET /api/analytics/deals/pipeline
// Returns: per-stage breakdown + monthly trends + summary totals
router.get("/deals/pipeline", ...auth, getDealPipeline);

// GET /api/analytics/deals/trends?days=30
// Returns: daily deal counts and value broken down by status
router.get("/deals/trends", ...auth, getDealTrends);

// ── Organizations ──────────────────────────────────────────────────────────
// GET /api/analytics/organizations/stats
// Returns: per-industry org count, avg size, leads, converted leads, conversion rate
router.get("/organizations/stats", ...auth, getOrganizationStats);

// GET /api/analytics/organizations/top?limit=10
// Returns: top orgs by total deal value with lead and deal counts
router.get("/organizations/top", ...auth, getTopOrganizations);

export default router;
