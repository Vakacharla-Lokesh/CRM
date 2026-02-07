import { Router } from "express";
import { z } from "zod";
import {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationsByTenant,
  getOrganizationsByUser,
} from "../controllers/organizationController.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";
import { authorize, injectTenantFilter } from "../middlewares/rbac.js";
import { createOrganizationSchema } from "../validators/organization.validator.js";

const router = Router();

// Validation schemas
const updateOrganizationSchema = z
  .object({
    organizationName: z.string().min(1).optional(),
    organizationSize: z.number().int().min(1).max(10_000_000).optional(),
    organizationWebsite: z.string().url().optional(),
    organizationIndustry: z
      .enum(["Software", "Textile", "Foods", "Others"])
      .optional(),
  })
  .strict();

// Routes
router.get(
  "/",
  authenticate,
  authorize("user", "admin", "super_admin"),
  injectTenantFilter,
  getAllOrganizations,
);

router.get(
  "/:id",
  authenticate,
  authorize("user", "admin", "super_admin"),
  getOrganizationById,
);

router.post(
  "/",
  authenticate,
  authorize("user", "admin", "super_admin"),
  validate(createOrganizationSchema),
  createOrganization,
);

router.put(
  "/:id",
  authenticate,
  authorize("user", "admin", "super_admin"),
  validate(updateOrganizationSchema),
  updateOrganization,
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin", "super_admin"),
  deleteOrganization,
);

router.get(
  "/tenant/:tenantId",
  authenticate,
  authorize("admin", "super_admin"),
  getOrganizationsByTenant,
);

router.get(
  "/user/:userId",
  authenticate,
  authorize("user", "admin", "super_admin"),
  getOrganizationsByUser,
);

export default router;
