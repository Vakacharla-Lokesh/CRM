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
  bulkDeleteLeads,
  bulkDeleteDeals,
  bulkDeleteOrganizations,
  uploadFile,
  importLeads,
  importDeals,
  importOrganizations,
} from "../controllers/bulkController.js";
import { authenticateRequest } from "../../../middlewares/auth.js";
import {
  requirePermission,
  injectTenantContext,
} from "../../../middlewares/rbac.js";
import { validate } from "../../../middlewares/validate.js";
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

router.post(
  "/leads/create",
  authenticateRequest,
  requirePermission("bulk:import"),
  injectTenantContext,
  validate(bulkCreateLeadsSchema),
  bulkCreateLeads,
);
router.post(
  "/leads/update",
  authenticateRequest,
  requirePermission("bulk:import"),
  injectTenantContext,
  validate(bulkUpdateLeadsSchema),
  bulkUpdateLeads,
);
router.post(
  "/leads/delete",
  authenticateRequest,
  requirePermission("bulk:delete"),
  injectTenantContext,
  bulkDeleteLeads,
);
router.post(
  "/leads/import",
  uploadFile,
  authenticateRequest,
  requirePermission("bulk:import"),
  injectTenantContext,
  importLeads,
);
router.post(
  "/deals/create",
  authenticateRequest,
  requirePermission("bulk:import"),
  injectTenantContext,
  validate(bulkCreateDealsSchema),
  bulkCreateDeals,
);
router.post(
  "/deals/update",
  authenticateRequest,
  requirePermission("bulk:import"),
  injectTenantContext,
  validate(bulkUpdateDealsSchema),
  bulkUpdateDeals,
);
router.post(
  "/deals/delete",
  authenticateRequest,
  requirePermission("bulk:delete"),
  injectTenantContext,
  bulkDeleteDeals,
);
router.post(
  "/deals/import",
  uploadFile,
  authenticateRequest,
  requirePermission("bulk:import"),
  injectTenantContext,
  importDeals,
);
router.post(
  "/comments/create",
  authenticateRequest,
  requirePermission("bulk:import"),
  injectTenantContext,
  validate(bulkCreateCommentsSchema),
  bulkCreateComments,
);
router.post(
  "/calls/create",
  authenticateRequest,
  requirePermission("bulk:import"),
  injectTenantContext,
  validate(bulkCreateCallsSchema),
  bulkCreateCalls,
);
router.post(
  "/organizations/create",
  authenticateRequest,
  requirePermission("bulk:import"),
  injectTenantContext,
  validate(bulkCreateOrganizationsSchema),
  bulkCreateOrganizations,
);
router.post(
  "/organizations/update",
  authenticateRequest,
  requirePermission("bulk:import"),
  injectTenantContext,
  validate(bulkUpdateOrganizationsSchema),
  bulkUpdateOrganizations,
);
router.post(
  "/organizations/delete",
  authenticateRequest,
  requirePermission("bulk:delete"),
  injectTenantContext,
  bulkDeleteOrganizations,
);
router.post(
  "/organizations/import",
  uploadFile,
  authenticateRequest,
  requirePermission("bulk:import"),
  injectTenantContext,
  importOrganizations,
);

export default router;
