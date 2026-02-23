import { Router } from "express";
import {
  bulkCreateLeads,
  bulkUpdateLeads,
  bulkCreateDeals,
  bulkUpdateDeals,
  bulkCreateComments,
  bulkCreateCalls,
  bulkCreateOrganizations,
  bulkUpdateOrganizations,
} from "../controllers/bulkController.js";
import { authenticate } from "../middlewares/auth.js";
import { authorize } from "../middlewares/rbac.js";
import passport from "../config/passport.js";

const router = Router();

router.use(passport.authenticate("jwt", { session: false }));

// Bulk leads operations
router.post(
  "/leads/create",
  authenticate,
  authorize("user", "admin", "super_admin"),
  bulkCreateLeads,
);

router.post(
  "/leads/update",
  authenticate,
  authorize("user", "admin", "super_admin"),
  bulkUpdateLeads,
);

// Bulk deals operations
router.post(
  "/deals/create",
  authenticate,
  authorize("user", "admin", "super_admin"),
  bulkCreateDeals,
);

router.post(
  "/deals/update",
  authenticate,
  authorize("user", "admin", "super_admin"),
  bulkUpdateDeals,
);

// Bulk comments operations
router.post(
  "/comments/create",
  authenticate,
  authorize("user", "admin", "super_admin"),
  bulkCreateComments,
);

// Bulk calls operations
router.post(
  "/calls/create",
  authenticate,
  authorize("user", "admin", "super_admin"),
  bulkCreateCalls,
);

// Bulk organizations operations
router.post(
  "/organizations/create",
  authenticate,
  authorize("user", "admin", "super_admin"),
  bulkCreateOrganizations,
);

router.post(
  "/organizations/update",
  authenticate,
  authorize("user", "admin", "super_admin"),
  bulkUpdateOrganizations,
);

export default router;
