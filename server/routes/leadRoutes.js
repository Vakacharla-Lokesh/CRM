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
  updateLeadScore,
  convertLeadToDeal,
} from "../controllers/leadController.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";
import { authorize, injectTenantFilter } from "../middlewares/rbac.js";
import {
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
  updateLeadScoreSchema,
} from "../validators/leadsValidator.js";

const router = Router();

// Routes
router.get(
  "/",
  authenticate,
  authorize("user", "admin", "super_admin"),
  injectTenantFilter,
  getAllLeads,
);

router.get(
  "/:id",
  authenticate,
  authorize("user", "admin", "super_admin"),
  getLeadById,
);

router.post(
  "/",
  authenticate,
  authorize("user", "admin", "super_admin"),
  validate(createLeadSchema),
  createLead,
);

router.put(
  "/:id",
  authenticate,
  authorize("user", "admin", "super_admin"),
  validate(updateLeadSchema),
  updateLead,
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin", "super_admin"),
  deleteLead,
);

router.get(
  "/tenant/:tenantId",
  authenticate,
  authorize("admin", "super_admin"),
  getLeadsByTenant,
);

router.get(
  "/user/:userId",
  authenticate,
  authorize("user", "admin", "super_admin"),
  getLeadsByUser,
);

router.get(
  "/organization/:organizationId",
  authenticate,
  authorize("user", "admin", "super_admin"),
  getLeadsByOrganization,
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("user", "admin", "super_admin"),
  validate(updateLeadStatusSchema),
  updateLeadStatus,
);

router.patch(
  "/:id/score",
  authenticate,
  authorize("user", "admin", "super_admin"),
  validate(updateLeadScoreSchema),
  updateLeadScore,
);

router.post(
  "/:id/convert",
  authenticate,
  authorize("user", "admin", "super_admin"),
  convertLeadToDeal,
);

export default router;
