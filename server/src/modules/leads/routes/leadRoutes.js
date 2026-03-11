import { Router } from "express";
import {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  getLeadsByTenant,
  getLeadsByUser,
  getLeadsByOrganization,
  updateLeadStatus,
  convertLeadToDeal,
  updateLeadScoreManually,
  searchLeads,
  assignLead,
} from "../controllers/leadController.js";
import { getLeadActivities } from "../controllers/leadActivityController.js";
import { validate } from "../../../middlewares/validate.js";
import { authenticateRequest } from "../../../middlewares/auth.js";
import { requirePermission, injectTenantContext } from "../../../middlewares/rbac.js";
import {
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
  updateLeadScoreSchema,
  convertLeadSchema,
} from "../validators/leadsValidator.js";

const router = Router();

router.get(
  "/",
  authenticateRequest,
  requirePermission("leads:read"),
  injectTenantContext,
  getAllLeads,
);
router.get(
  "/search",
  authenticateRequest,
  requirePermission("leads:read"),
  injectTenantContext,
  searchLeads,
);
router.get(
  "/:id/activities",
  authenticateRequest,
  requirePermission("leads:read"),
  injectTenantContext,
  getLeadActivities,
);
router.get(
  "/:id",
  authenticateRequest,
  requirePermission("leads:read"),
  injectTenantContext,
  getLeadById,
);
router.post(
  "/",
  authenticateRequest,
  requirePermission("leads:write"),
  injectTenantContext,
  validate(createLeadSchema),
  createLead,
);
router.put(
  "/:id",
  authenticateRequest,
  requirePermission("leads:write"),
  injectTenantContext,
  validate(updateLeadSchema),
  updateLead,
);
router.delete(
  "/:id",
  authenticateRequest,
  requirePermission("leads:delete"),
  injectTenantContext,
  deleteLead,
);
router.get(
  "/tenant/:tenantId",
  authenticateRequest,
  requirePermission("leads:view_all"),
  injectTenantContext,
  getLeadsByTenant,
);
router.get(
  "/user/:userId",
  authenticateRequest,
  requirePermission("leads:read"),
  injectTenantContext,
  getLeadsByUser,
);
router.get(
  "/organization/:organizationId",
  authenticateRequest,
  requirePermission("leads:read"),
  injectTenantContext,
  getLeadsByOrganization,
);
router.patch(
  "/:id/status",
  authenticateRequest,
  requirePermission("leads:write"),
  injectTenantContext,
  validate(updateLeadStatusSchema),
  updateLeadStatus,
);
router.patch(
  "/:id/score",
  authenticateRequest,
  requirePermission("leads:write"),
  injectTenantContext,
  validate(updateLeadScoreSchema),
  updateLeadScoreManually,
);
router.post(
  "/:id/convert",
  authenticateRequest,
  requirePermission("leads:write"),
  injectTenantContext,
  validate(convertLeadSchema),
  convertLeadToDeal,
);

router.patch(
  "/:id/assign",
  authenticateRequest,
  requirePermission("leads:assign"),
  injectTenantContext,
  assignLead,
);

export default router;
