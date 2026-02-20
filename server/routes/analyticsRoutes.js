import { Router } from "express";
import {
  getDashboardStats,
  getLeadTrends,
  getDealPipeline,
} from "../controllers/analyticsController.js";
import { authenticate } from "../middlewares/auth.js";
import { injectTenantFilter } from "../middlewares/rbac.js";

const router = Router();

// Dashboard analytics - accessible by all authenticated users
router.get(
  "/dashboard",
  authenticate,
  injectTenantFilter,
  getDashboardStats
);

// Lead trends - accessible by all authenticated users
router.get(
  "/leads/trends",
  authenticate,
  injectTenantFilter,
  getLeadTrends
);

// Deal pipeline analytics - accessible by all authenticated users
router.get(
  "/deals/pipeline",
  authenticate,
  injectTenantFilter,
  getDealPipeline
);

export default router;
