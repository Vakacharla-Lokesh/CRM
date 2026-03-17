import { Router } from "express";
import {
  exportLeads,
  exportOrganizations,
  exportDeals,
  exportLeadsToEmail,
  exportOrganizationsToEmail,
  exportDealsToEmail,
} from "../controllers/exportController.js";
import { authenticateRequest } from "../../../middlewares/auth.js";
import {
  requirePermission,
  injectTenantContext,
} from "../../../middlewares/rbac.js";
import { validate } from "../../../middlewares/validate.js";
import {
  exportLeadsSchema,
  exportOrganizationsSchema,
  exportDealsSchema,
  exportLeadsToEmailSchema,
  exportOrganizationsToEmailSchema,
  exportDealsToEmailSchema,
} from "../validators/exportValidator.js";

const router = Router();

router.post(
  "/leads",
  authenticateRequest,
  requirePermission("leads:export"),
  injectTenantContext,
  validate(exportLeadsSchema),
  exportLeads,
);
router.post(
  "/organizations",
  authenticateRequest,
  requirePermission("organizations:export"),
  injectTenantContext,
  validate(exportOrganizationsSchema),
  exportOrganizations,
);
router.post(
  "/deals",
  authenticateRequest,
  requirePermission("deals:export"),
  injectTenantContext,
  validate(exportDealsSchema),
  exportDeals,
);
router.post(
  "/leads/toemail",
  authenticateRequest,
  requirePermission("leads:export"),
  injectTenantContext,
  validate(exportLeadsToEmailSchema),
  exportLeadsToEmail,
);
router.post(
  "/organizations/toemail",
  authenticateRequest,
  requirePermission("organizations:export"),
  injectTenantContext,
  validate(exportOrganizationsToEmailSchema),
  exportOrganizationsToEmail,
);
router.post(
  "/deals/toemail",
  authenticateRequest,
  requirePermission("deals:export"),
  injectTenantContext,
  validate(exportDealsToEmailSchema),
  exportDealsToEmail,
);

export default router;
