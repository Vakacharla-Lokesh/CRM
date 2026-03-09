import { Router } from "express";
import {
  createCampaign,
  listCampaigns,
  getCampaign,
  trackEmailOpen,
} from "../controllers/campaignController.js";
import { authenticateRequest, checkActive } from "../middlewares/auth.js";
import { requirePermission, injectTenantContext } from "../middlewares/rbac.js";

const router = Router();

router.get("/track/:campaignEmailId", trackEmailOpen);

router.get(
  "/",
  authenticateRequest,
  checkActive,
  requirePermission("campaigns:read"),
  injectTenantContext,
  listCampaigns,
);

router.get(
  "/:id",
  authenticateRequest,
  checkActive,
  requirePermission("campaigns:read"),
  injectTenantContext,
  getCampaign,
);

router.post(
  "/",
  authenticateRequest,
  checkActive,
  requirePermission("campaigns:write"),
  injectTenantContext,
  createCampaign,
);

export default router;
