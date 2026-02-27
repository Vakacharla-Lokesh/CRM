import { Router } from "express";
import {
  getUserAnalyticsDashboard,
  saveUserAnalyticsDashboard,
} from "../controllers/userAnalyticsController.js";
import { authenticate } from "../middlewares/auth.js";
import { authorize, injectTenantFilter } from "../middlewares/rbac.js";
import passport from "../config/passport.js";

const router = Router();

const auth = [authenticate, authorize("user", "admin", "super_admin"), injectTenantFilter];

router.use(passport.authenticate("jwt", { session: false }));

// GET /api/user-analytics — fetch layout + computed chart data
router.get("/", ...auth, getUserAnalyticsDashboard);

// PUT /api/user-analytics — save updated layout
router.put("/", ...auth, saveUserAnalyticsDashboard);

export default router;
