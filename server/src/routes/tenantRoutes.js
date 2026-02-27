import { Router } from "express";
import {
  getAllTenants,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant,
  searchTenants,
} from "../controllers/tenantController.js";
import { validate } from "../middlewares/validate.js";
import { authenticateRequest, checkActive } from "../middlewares/auth.js";
import { requirePermission, injectTenantContext } from "../middlewares/rbac.js";
import {
  createTenantSchema,
  updateTenantSchema,
} from "../validators/tenantsValidator.js";

const router = Router();

router.get(
  "/",
  authenticateRequest,
  requirePermission("tenants:read"),
  injectTenantContext,
  getAllTenants,
);
router.get(
  "/search",
  authenticateRequest,
  requirePermission("tenants:read"),
  injectTenantContext,
  searchTenants,
);
router.get(
  "/:id",
  authenticateRequest,
  requirePermission("tenants:read"),
  injectTenantContext,
  getTenantById,
);
router.post(
  "/",
  authenticateRequest,
  checkActive,
  requirePermission("tenants:write"),
  injectTenantContext,
  validate(createTenantSchema),
  createTenant,
);
router.put(
  "/:id",
  authenticateRequest,
  checkActive,
  requirePermission("tenants:write"),
  injectTenantContext,
  validate(updateTenantSchema),
  updateTenant,
);
router.delete(
  "/:id",
  authenticateRequest,
  requirePermission("tenants:delete"),
  injectTenantContext,
  deleteTenant,
);

export default router;
