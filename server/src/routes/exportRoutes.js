import { Router } from "express";
import {
  exportLeads,
  exportOrganizations,
  exportDeals,
  exportLeadsToEmail,
  exportOrganizationsToEmail,
  exportDealsToEmail,
} from "../controllers/exportController.js";
import { authenticate } from "../middlewares/auth.js";
import { authorize, injectTenantFilter } from "../middlewares/rbac.js";
import { validate } from "../middlewares/validate.js";
import {
  exportLeadsSchema,
  exportOrganizationsSchema,
  exportDealsSchema,
  exportLeadsToEmailSchema,
  exportOrganizationsToEmailSchema,
  exportDealsToEmailSchema,
} from "../validators/exportValidator.js";
import passport from "../config/passport.js";

const router = Router();

router.use(passport.authenticate("jwt", { session: false }));

router.post(
  "/leads",
  authenticate,
  authorize("user", "admin", "super_admin"),
  injectTenantFilter,
  validate(exportLeadsSchema),
  exportLeads,
);

router.post(
  "/organizations",
  authenticate,
  authorize("user", "admin", "super_admin"),
  injectTenantFilter,
  validate(exportOrganizationsSchema),
  exportOrganizations,
);

router.post(
  "/deals",
  authenticate,
  authorize("user", "admin", "super_admin"),
  injectTenantFilter,
  validate(exportDealsSchema),
  exportDeals,
);

// Email export routes
router.post(
  "/leads/toemail",
  authenticate,
  authorize("user", "admin", "super_admin"),
  injectTenantFilter,
  validate(exportLeadsToEmailSchema),
  exportLeadsToEmail,
);

router.post(
  "/organizations/toemail",
  authenticate,
  authorize("user", "admin", "super_admin"),
  injectTenantFilter,
  validate(exportOrganizationsToEmailSchema),
  exportOrganizationsToEmail,
);

router.post(
  "/deals/toemail",
  authenticate,
  authorize("user", "admin", "super_admin"),
  injectTenantFilter,
  validate(exportDealsToEmailSchema),
  exportDealsToEmail,
);

export default router;
