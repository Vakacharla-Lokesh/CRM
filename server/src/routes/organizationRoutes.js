import { Router } from "express";
import {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationsByTenant,
  getOrganizationsByUser,
  searchOrganizations,
  bulkDeleteOrganizationsController,
} from "../controllers/organizationController.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";
import { authorize, injectTenantFilter } from "../middlewares/rbac.js";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from "../validators/organizationValidator.js";
import passport from "../config/passport.js";

const router = Router();

router.use(passport.authenticate("jwt", { session: false }));

// Routes
router.get(
  "/",
  authenticate,
  authorize("user", "admin", "super_admin"),
  injectTenantFilter,
  getAllOrganizations,
);

router.get(
  "/search",
  authenticate,
  authorize("user", "admin", "super_admin"),
  injectTenantFilter,
  searchOrganizations,
);

router.post(
  "/bulk-delete",
  authenticate,
  authorize("admin", "super_admin"),
  bulkDeleteOrganizationsController,
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
  authorize("user", "admin", "super_admin"),
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
