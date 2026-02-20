import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersByTenant,
  updateUserRole,
  getCurrentUser,
  searchUsers,
  getUserStats,
  updatePassword,
  sendPasswordReset,
  updateProfile,
  getUserActivity,
  getUserPermissions,
} from "../controllers/userController.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";
import { authorize, injectTenantFilter } from "../middlewares/rbac.js";
import {
  createUserSchema,
  updateUserSchema,
  updateRoleSchema,
  updatePasswordSchema,
  passwordResetSchema,
  updateProfileSchema,
} from "../validators/userValidators.js";

const router = Router();

// Public routes
router.post(
  "/password-reset",
  validate(passwordResetSchema),
  sendPasswordReset,
);

// Authenticated routes - Specific paths before dynamic /:id
router.get(
  "/me",
  authenticate,
  getCurrentUser,
);

router.get(
  "/search",
  authenticate,
  authorize("admin", "super_admin"),
  injectTenantFilter,
  searchUsers,
);

router.get(
  "/stats",
  authenticate,
  authorize("admin", "super_admin"),
  injectTenantFilter,
  getUserStats,
);

// General user routes
router.get(
  "/",
  authenticate,
  authorize("admin", "super_admin"),
  injectTenantFilter,
  getAllUsers,
);

router.post(
  "/",
  authenticate,
  authorize("admin", "super_admin"),
  validate(createUserSchema),
  createUser,
);

// Tenant-specific route
router.get(
  "/tenant/:tenantId",
  authenticate,
  authorize("admin", "super_admin"),
  getUsersByTenant,
);

// User-specific routes
router.get(
  "/:id",
  authenticate,
  authorize("admin", "super_admin"),
  getUserById,
);

router.put(
  "/:id",
  authenticate,
  authorize("admin", "super_admin"),
  validate(updateUserSchema),
  updateUser,
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin", "super_admin"),
  deleteUser,
);

router.patch(
  "/:id/role",
  authenticate,
  authorize("super_admin"),
  validate(updateRoleSchema),
  updateUserRole,
);

router.put(
  "/:id/password",
  authenticate,
  validate(updatePasswordSchema),
  updatePassword,
);

router.patch(
  "/:id/profile",
  authenticate,
  validate(updateProfileSchema),
  updateProfile,
);

router.get(
  "/:id/activity",
  authenticate,
  getUserActivity,
);

router.get(
  "/:id/permissions",
  authenticate,
  getUserPermissions,
);

export default router;
