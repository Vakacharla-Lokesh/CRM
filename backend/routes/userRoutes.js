import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersByTenant,
  updateUserRole,
} from "../controllers/userController.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";
import { authorize, injectTenantFilter } from "../middlewares/rbac.js";
import {
  createUserSchema,
  updateUserSchema,
  updateRoleSchema,
} from "../validators/userValidators.js";

const router = Router();

// Routes
router.get(
  "/",
  authenticate,
  authorize("admin", "super_admin"),
  injectTenantFilter,
  getAllUsers,
);

router.get(
  "/:id",
  authenticate,
  authorize("admin", "super_admin"),
  getUserById,
);

router.post(
  "/",
  authenticate,
  authorize("admin", "super_admin"),
  validate(createUserSchema),
  createUser,
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

router.get(
  "/tenant/:tenantId",
  authenticate,
  authorize("admin", "super_admin"),
  getUsersByTenant,
);

router.patch(
  "/:id/role",
  authenticate,
  authorize("super_admin"),
  validate(updateRoleSchema),
  updateUserRole,
);

export default router;
