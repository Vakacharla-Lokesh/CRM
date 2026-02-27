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
import { authenticate } from "../middlewares/auth.js";
import { authorize, injectTenantFilter } from "../middlewares/rbac.js";
import {
  createRoleSchema,
  updateRoleSchema,
} from "../validators/roleValidator.js";
import passport from "../config/passport.js";

const router = Router();

// Apply JWT authentication to all routes
router.use(passport.authenticate("jwt", { session: false }));

// GET all roles for tenant
router.get(
  "/",
  authenticate,
  authorize("admin", "super_admin"),
  injectTenantFilter,
  getAllRoles,
);

// GET single role by ID
router.get(
  "/:id",
  authenticate,
  authorize("admin", "super_admin"),
  getRoleById,
);

// GET permissions for a role (available to all authenticated users)
router.get(
  "/:id/permissions",
  authenticate,
  authorize("user", "admin", "super_admin"),
  getRolePermissions,
);

// CREATE new role
router.post(
  "/",
  authenticate,
  authorize("admin", "super_admin"),
  validate(createRoleSchema),
  createRole,
);

// UPDATE role
router.put(
  "/:id",
  authenticate,
  authorize("admin", "super_admin"),
  validate(updateRoleSchema),
  updateRole,
);

// DELETE role (soft delete)
router.delete(
  "/:id",
  authenticate,
  authorize("super_admin"), // Only super_admin can delete roles
  deleteRole,
);

export default router;
