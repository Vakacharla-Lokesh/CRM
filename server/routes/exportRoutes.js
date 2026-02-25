import { Router } from "express";
import {
  exportLeads,
  exportOrganizations,
  exportDeals,
} from "../controllers/exportController.js";
import { authenticate } from "../middlewares/auth.js";
import { authorize, injectTenantFilter } from "../middlewares/rbac.js";
import { validate } from "../middlewares/validate.js";
import {
  exportLeadsSchema,
  exportOrganizationsSchema,
  exportDealsSchema,
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

export default router;
