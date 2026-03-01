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
import { authenticateRequest } from "../middlewares/auth.js";
import { requirePermission, injectTenantContext } from "../middlewares/rbac.js";
import {
  createUserSchema,
  updateUserSchema,
  updateRoleSchema,
  updatePasswordSchema,
  passwordResetSchema,
  updateProfileSchema,
} from "../validators/userValidators.js";
import { assignRoleSchema } from "../validators/roleValidator.js";

const router = Router();

router.post(
  "/password-reset",
  validate(passwordResetSchema),
  sendPasswordReset,
);
router.get("/me", authenticateRequest, getCurrentUser);
router.get(
  "/search",
  authenticateRequest,
  requirePermission("users:read"),
  injectTenantContext,
  searchUsers,
);
router.get(
  "/stats",
  authenticateRequest,
  requirePermission("users:read"),
  injectTenantContext,
  getUserStats,
);
router.get(
  "/",
  authenticateRequest,
  requirePermission("users:read"),
  injectTenantContext,
  getAllUsers,
);
router.post(
  "/",
  authenticateRequest,
  requirePermission("users:write"),
  injectTenantContext,
  validate(createUserSchema),
  createUser,
);
router.get(
  "/tenant/:tenantId",
  authenticateRequest,
  requirePermission("users:view_all"),
  injectTenantContext,
  getUsersByTenant,
);
router.get(
  "/:id",
  authenticateRequest,
  requirePermission("users:read"),
  injectTenantContext,
  getUserById,
);
router.put(
  "/:id",
  authenticateRequest,
  requirePermission("users:write"),
  injectTenantContext,
  validate(updateUserSchema),
  updateUser,
);
router.delete(
  "/:id",
  authenticateRequest,
  requirePermission("users:delete"),
  injectTenantContext,
  deleteUser,
);
router.patch(
  "/:id/role",
  authenticateRequest,
  requirePermission("users:manage_roles"),
  injectTenantContext,
  validate(assignRoleSchema),
  assignRoleToUser,
);
router.put(
  "/:id/password",
  authenticateRequest,
  validate(updatePasswordSchema),
  updatePassword,
);
router.patch(
  "/:id/profile",
  authenticateRequest,
  validate(updateProfileSchema),
  updateProfile,
);
router.get(
  "/:id/activity",
  authenticateRequest,
  injectTenantContext,
  getUserActivity,
);
router.get("/:id/permissions", authenticateRequest, getUserPermissions);

export default router;
