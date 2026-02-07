import { Router } from "express";
import { z } from "zod";
import {
  getAllTenants,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant,
} from "../controllers/tenantController.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";
import { authorize } from "../middlewares/rbac.js";
import { createTenantSchema } from "../validators/tenants.validator.js";

const router = Router();

// Validation schemas
const updateTenantSchema = z
  .object({
    tenantName: z.string().min(1).optional(),
  })
  .strict();

// Routes - Only super_admin can manage tenants
router.get("/", authenticate, authorize("super_admin"), getAllTenants);

router.get("/:id", authenticate, authorize("super_admin"), getTenantById);

router.post(
  "/",
  authenticate,
  authorize("super_admin"),
  validate(createTenantSchema),
  createTenant,
);

router.put(
  "/:id",
  authenticate,
  authorize("super_admin"),
  validate(updateTenantSchema),
  updateTenant,
);

router.delete("/:id", authenticate, authorize("super_admin"), deleteTenant);

export default router;
