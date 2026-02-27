import { Router } from "express";
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissions,
} from "../controllers/roleController.js";
import { validate } from "../middlewares/validate.js";
import { authenticateRequest } from "../middlewares/auth.js";
import { requirePermission, injectTenantContext } from "../middlewares/rbac.js";
import {
  createRoleSchema,
  updateRoleSchema,
} from "../validators/roleValidator.js";

const router = Router();

router.get(
  "/",
  authenticateRequest,
  requirePermission("roles:read"),
  injectTenantContext,
  getAllRoles,
);
router.get(
  "/:id",
  authenticateRequest,
  requirePermission("roles:read"),
  injectTenantContext,
  getRoleById,
);
router.get(
  "/:id/permissions",
  authenticateRequest,
  requirePermission("roles:read"),
  injectTenantContext,
  getRolePermissions,
);
router.post(
  "/",
  authenticateRequest,
  requirePermission("roles:write"),
  injectTenantContext,
  validate(createRoleSchema),
  createRole,
);
router.put(
  "/:id",
  authenticateRequest,
  requirePermission("roles:write"),
  injectTenantContext,
  validate(updateRoleSchema),
  updateRole,
);
router.delete(
  "/:id",
  authenticateRequest,
  requirePermission("roles:delete"),
  injectTenantContext,
  deleteRole,
);

export default router;
