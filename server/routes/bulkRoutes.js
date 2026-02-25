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
import { validate } from "../middlewares/validate.js";
import {
  bulkCreateLeadsSchema,
  bulkUpdateLeadsSchema,
  bulkCreateDealsSchema,
  bulkUpdateDealsSchema,
  bulkCreateCommentsSchema,
  bulkCreateCallsSchema,
  bulkCreateOrganizationsSchema,
  bulkUpdateOrganizationsSchema,
} from "../validators/bulkValidator.js";

const router = Router();

router.use(passport.authenticate("jwt", { session: false }));

// Bulk leads operations
router.post(
  "/leads/create",
  authenticate,
  authorize("user", "admin", "super_admin"),
  validate(bulkCreateLeadsSchema),
  bulkCreateLeads,
);

router.post(
  "/leads/update",
  authenticate,
  authorize("user", "admin", "super_admin"),
  validate(bulkUpdateLeadsSchema),
  bulkUpdateLeads,
);

// Bulk deals operations
router.post(
  "/deals/create",
  authenticate,
  authorize("user", "admin", "super_admin"),
  validate(bulkCreateDealsSchema),
  bulkCreateDeals,
);

router.post(
  "/deals/update",
  authenticate,
  authorize("user", "admin", "super_admin"),
  validate(bulkUpdateDealsSchema),
  bulkUpdateDeals,
);

// Bulk comments operations
router.post(
  "/comments/create",
  authenticate,
  authorize("user", "admin", "super_admin"),
  validate(bulkCreateCommentsSchema),
  bulkCreateComments,
);

// Bulk calls operations
router.post(
  "/calls/create",
  authenticate,
  authorize("user", "admin", "super_admin"),
  validate(bulkCreateCallsSchema),
  bulkCreateCalls,
);

// Bulk organizations operations
router.post(
  "/organizations/create",
  authenticate,
  authorize("user", "admin", "super_admin"),
  validate(bulkCreateOrganizationsSchema),
  bulkCreateOrganizations,
);

router.post(
  "/organizations/update",
  authenticate,
  authorize("user", "admin", "super_admin"),
  validate(bulkUpdateOrganizationsSchema),
  bulkUpdateOrganizations,
);

export default router;
