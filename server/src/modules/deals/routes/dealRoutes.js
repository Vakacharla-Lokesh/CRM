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
  searchDeals,
} from "../controllers/dealController.js";
import { validate } from "../../../middlewares/validate.js";
import { authenticateRequest } from "../../../middlewares/auth.js";
import { requirePermission, injectTenantContext } from "../../../middlewares/rbac.js";
import {
  createDealSchema,
  updateDealSchema,
  updateDealStatusSchema,
} from "../validators/dealsValidator.js";

const router = Router();

router.get(
  "/",
  authenticateRequest,
  requirePermission("deals:read"),
  injectTenantContext,
  getAllDeals,
);
router.get(
  "/search",
  authenticateRequest,
  requirePermission("deals:read"),
  injectTenantContext,
  searchDeals,
);
router.get(
  "/:id",
  authenticateRequest,
  requirePermission("deals:read"),
  injectTenantContext,
  getDealById,
);
router.post(
  "/",
  authenticateRequest,
  requirePermission("deals:write"),
  injectTenantContext,
  validate(createDealSchema),
  createDeal,
);
router.put(
  "/:id",
  authenticateRequest,
  requirePermission("deals:write"),
  injectTenantContext,
  validate(updateDealSchema),
  updateDeal,
);
router.delete(
  "/:id",
  authenticateRequest,
  requirePermission("deals:delete"),
  injectTenantContext,
  deleteDeal,
);
router.get(
  "/tenant/:tenantId",
  authenticateRequest,
  requirePermission("deals:view_all"),
  injectTenantContext,
  getDealsByTenant,
);
router.get(
  "/user/:userId",
  authenticateRequest,
  requirePermission("deals:read"),
  injectTenantContext,
  getDealsByUser,
);
router.get(
  "/lead/:leadId",
  authenticateRequest,
  requirePermission("deals:read"),
  injectTenantContext,
  getDealsByLead,
);
router.get(
  "/organization/:organizationId",
  authenticateRequest,
  requirePermission("deals:read"),
  injectTenantContext,
  getDealsByOrganization,
);
router.patch(
  "/:id/status",
  authenticateRequest,
  requirePermission("deals:write"),
  injectTenantContext,
  validate(updateDealStatusSchema),
  updateDealStatus,
);

export default router;
