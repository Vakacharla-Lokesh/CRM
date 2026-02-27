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
  assignRoleToUser,
} from "../controllers/userController.js";
import { validate } from "../middlewares/validate.js";
import { authenticate, checkActive } from "../middlewares/auth.js";
import { authorize, injectTenantFilter } from "../middlewares/rbac.js";
import {
  createUserSchema,
  updateUserSchema,
  updateRoleSchema,
  updatePasswordSchema,
  passwordResetSchema,
  updateProfileSchema,
} from "../validators/userValidators.js";
import passport from "../config/passport.js";

import { assignRoleSchema } from "../validators/roleValidator.js";

const router = Router();

router.use(passport.authenticate("jwt", { session: false }));

// Public routes
router.post(
  "/password-reset",
  validate(passwordResetSchema),
  sendPasswordReset,
);

// Authenticated routes - Specific paths before dynamic /:id
router.get("/me", authenticate, getCurrentUser);

router.get(
  "/search",
  authenticate,
  checkActive,
  authorize("admin", "super_admin"),
  injectTenantFilter,
  searchUsers,
);

router.get(
  "/stats",
  authenticate,
  checkActive,
  authorize("admin", "super_admin"),
  injectTenantFilter,
  getUserStats,
);

// General user routes
router.get(
  "/",
  authenticate,
  checkActive,
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
  authorize("super_admin"),
  getUsersByTenant,
);

// User-specific routes
router.get(
  "/:id",
  authenticate,
  checkActive,
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

// Assign role to user
router.patch(
  "/:id/role",
  authenticate,
  authorize("admin", "super_admin"),
  validate(assignRoleSchema),
  assignRoleToUser,
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

router.get("/:id/activity", authenticate, getUserActivity);

router.get("/:id/permissions", authenticate, getUserPermissions);

export default router;
