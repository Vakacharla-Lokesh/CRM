import { Router } from "express";
import {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationsByTenant,
  getOrganizationsByUser,
  searchOrganizations,
  bulkDeleteOrganizationsController,
} from "../controllers/organizationController.js";
import { validate } from "../middlewares/validate.js";
import { authenticateRequest } from "../middlewares/auth.js";
import { requirePermission, injectTenantContext } from "../middlewares/rbac.js";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from "../validators/organizationValidator.js";

const router = Router();

router.get(
  "/",
  authenticateRequest,
  requirePermission("organizations:read"),
  injectTenantContext,
  getAllOrganizations,
);
router.get(
  "/search",
  authenticateRequest,
  requirePermission("organizations:read"),
  injectTenantContext,
  searchOrganizations,
);
router.post(
  "/bulk-delete",
  authenticateRequest,
  requirePermission("organizations:delete"),
  injectTenantContext,
  bulkDeleteOrganizationsController,
);
router.get(
  "/:id",
  authenticateRequest,
  requirePermission("organizations:read"),
  injectTenantContext,
  getOrganizationById,
);
router.post(
  "/",
  authenticateRequest,
  requirePermission("organizations:write"),
  injectTenantContext,
  validate(createOrganizationSchema),
  createOrganization,
);
router.put(
  "/:id",
  authenticateRequest,
  requirePermission("organizations:write"),
  injectTenantContext,
  validate(updateOrganizationSchema),
  updateOrganization,
);
router.delete(
  "/:id",
  authenticateRequest,
  requirePermission("organizations:delete"),
  injectTenantContext,
  deleteOrganization,
);
router.get(
  "/tenant/:tenantId",
  authenticateRequest,
  requirePermission("organizations:view_all"),
  injectTenantContext,
  getOrganizationsByTenant,
);
router.get(
  "/user/:userId",
  authenticateRequest,
  requirePermission("organizations:read"),
  injectTenantContext,
  getOrganizationsByUser,
);

export default router;
