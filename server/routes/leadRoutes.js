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
} from "../controllers/leadController.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";
import { authorize, injectTenantFilter } from "../middlewares/rbac.js";
import {
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
  updateLeadScoreSchema,
  convertLeadSchema,
} from "../validators/leadsValidator.js";
import passport from "../config/passport.js";
import { z } from "zod";

const router = Router();

const idSchema = z.object({
  id: z.string().refine((id) => {
    try {
      return new ObjectId(id).toString() === id;
    } catch {
      return false;
    }
  }),
});

router.use(passport.authenticate("jwt", { session: false }));

// Routes
router.get(
  "/",
  authenticate,
  authorize("user", "admin", "super_admin"),
  injectTenantFilter,
  getAllLeads,
);

router.get(
  "/search",
  authenticate,
  authorize("user", "admin", "super_admin"),
  injectTenantFilter,
  searchLeads,
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
  authorize("user", "admin", "super_admin"),
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
  updateLeadScoreManually,
);

router.post(
  "/:id/convert",
  authenticate,
  authorize("user", "admin", "super_admin"),
  validate(convertLeadSchema),
  convertLeadToDeal,
);

export default router;
