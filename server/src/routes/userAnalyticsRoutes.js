import { Router } from "express";
import {
  getUserAnalyticsDashboard,
  saveUserAnalyticsDashboard,
} from "../controllers/userAnalyticsController.js";
import { authenticateRequest } from "../middlewares/auth.js";
import { requirePermission, injectTenantContext } from "../middlewares/rbac.js";

const router = Router();
const auth = [
  authenticateRequest,
  requirePermission("analytics:read"),
  injectTenantContext,
];

router.get("/", ...auth, getUserAnalyticsDashboard);
router.put("/", ...auth, saveUserAnalyticsDashboard);

export default router;
