import { Router } from "express";
import {
  bulkCreateLeads,
  bulkUpdateLeads,
  bulkCreateDeals,
  bulkUpdateDeals,
  bulkCreateComments,
  bulkCreateCalls,
} from "../controllers/bulkController.js";
import { authenticate } from "../middlewares/auth.js";
import { authorize } from "../middlewares/rbac.js";

const router = Router();

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

export default router;
