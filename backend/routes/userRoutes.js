import { Router } from "express";
import { z } from "zod";
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
import { createUserSchema } from "../validators/user.validators.js";

const router = Router();

// Validation schemas
const updateUserSchema = z
  .object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().optional(),
    userEmail: z.string().email().optional(),
    mobile: z.string().regex(/^[1-9]\d{9}$/).optional(),
    role: z.enum(["user", "admin", "super_admin"]).optional(),
    password: z.string().min(8).optional(),
  })
  .strict();

const updateRoleSchema = z
  .object({
    role: z.enum(["user", "admin", "super_admin"]),
  })
  .strict();

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
