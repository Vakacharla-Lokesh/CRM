import { Router } from "express";
import {
  createCampaign,
  listCampaigns,
  getCampaign,
  trackEmailOpen,
  trackLinkClick,
} from "../controllers/campaignController.js";
import {
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  incrementTemplateUsage,
} from "../controllers/campaignTemplateController.js";
import { authenticateRequest, checkActive } from "../../../middlewares/auth.js";
import {
  requirePermission,
  injectTenantContext,
} from "../../../middlewares/rbac.js";

const router = Router();

router.get("/track/:campaignEmailId", trackEmailOpen);
router.get("/link/:campaignEmailId", trackLinkClick);

const auth = [authenticateRequest, checkActive];
const readAccess = [
  ...auth,
  requirePermission("campaigns:read"),
  injectTenantContext,
];
const writeAccess = [
  ...auth,
  requirePermission("campaigns:write"),
  injectTenantContext,
];

router.get("/templates", ...readAccess, listTemplates);
router.post("/templates", ...writeAccess, createTemplate);
router.patch("/templates/:id", ...writeAccess, updateTemplate);
router.delete("/templates/:id", ...writeAccess, deleteTemplate);
router.post("/templates/:id/use", ...writeAccess, incrementTemplateUsage);

router.get("/", ...readAccess, listCampaigns);
router.get("/:id", ...readAccess, getCampaign);
router.post("/", ...writeAccess, createCampaign);

export default router;
