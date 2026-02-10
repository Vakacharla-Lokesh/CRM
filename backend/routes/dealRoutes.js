import { Router } from "express";
import {
  getAllDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal,
  getDealsByTenant,
  getDealsByUser,
  getDealsByLead,
  getDealsByOrganization,
  updateDealStatus,
} from "../controllers/dealController.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";
import { authorize, injectTenantFilter } from "../middlewares/rbac.js";
import {
  createDealSchema,
  updateDealSchema,
  updateDealStatusSchema,
} from "../validators/dealsValidator.js";

const router = Router();

// Routes
router.get(
  "/",
  authenticate,
  authorize("user", "admin", "super_admin"),
  injectTenantFilter,
  getAllDeals,
);

router.get(
  "/:id",
  authenticate,
  authorize("user", "admin", "super_admin"),
  getDealById,
);

router.post(
  "/",
  authenticate,
  authorize("user", "admin", "super_admin"),
  validate(createDealSchema),
  createDeal,
);

router.put(
  "/:id",
  authenticate,
  authorize("user", "admin", "super_admin"),
  validate(updateDealSchema),
  updateDeal,
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin", "super_admin"),
  deleteDeal,
);

router.get(
  "/tenant/:tenantId",
  authenticate,
  authorize("admin", "super_admin"),
  getDealsByTenant,
);

router.get(
  "/user/:userId",
  authenticate,
  authorize("user", "admin", "super_admin"),
  getDealsByUser,
);

router.get(
  "/lead/:leadId",
  authenticate,
  authorize("user", "admin", "super_admin"),
  getDealsByLead,
);

router.get(
  "/organization/:organizationId",
  authenticate,
  authorize("user", "admin", "super_admin"),
  getDealsByOrganization,
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("user", "admin", "super_admin"),
  validate(updateDealStatusSchema),
  updateDealStatus,
);

export default router;
