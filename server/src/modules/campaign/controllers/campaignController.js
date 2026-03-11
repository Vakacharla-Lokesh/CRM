import asyncCatch from "../../../utils/asyncCatch.js";
import AppError from "../../../utils/appError.js";
import {
  createAndDispatchCampaign,
  recordEmailOpen,
  recordLinkClick,
  getCampaigns,
  getCampaignById,
} from "../services/campaignService.js";
import { logActivity } from "../../leads/services/leadActivityService.js";
import { updateLeadScore } from "../../../utils/leadScoreUtils.js";

export const createCampaign = asyncCatch(async (req, res) => {
  const { subject, body, leadIds } = req.body;

  if (!subject || !body || !Array.isArray(leadIds) || !leadIds.length) {
    throw new AppError("subject, body, and leadIds[] are required", 400);
  }

  const tenantId =
    req.tenantContext?.scope === "tenant" ? req.tenantContext.tenantId : null;

  const campaign = await createAndDispatchCampaign({
    tenantId,
    userId: req.auth.userId,
    subject,
    body,
    leadIds,
  });

  res.status(202).json({
    message: "Campaign queued successfully",
    campaignId: campaign._id,
    status: campaign.status,
    total: campaign.totalRecipients,
  });
});

export const listCampaigns = asyncCatch(async (req, res) => {
  const tenantId =
    req.tenantContext?.scope === "tenant" ? req.tenantContext.tenantId : null;
  const campaigns = await getCampaigns(tenantId);
  res.json({ count: campaigns.length, campaigns });
});

export const getCampaign = asyncCatch(async (req, res) => {
  const tenantId =
    req.tenantContext?.scope === "tenant" ? req.tenantContext.tenantId : null;
  const campaign = await getCampaignById(req.params.id, tenantId);
  res.json({ campaign });
});

export const trackEmailOpen = asyncCatch(async (req, res) => {
  const pixel = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64",
  );
  res.writeHead(200, {
    "Content-Type": "image/gif",
    "Content-Length": pixel.length,
    "Cache-Control": "no-store, no-cache, must-revalidate, private",
  });
  res.end(pixel);

  setImmediate(async () => {
    try {
      const ce = await recordEmailOpen(req.params.campaignEmailId);
      if (!ce) return;

      await logActivity({
        leadId: ce.leadId,
        tenantId: ce.tenantId,
        type: "email_opened",
        description: "Lead opened a campaign email",
        metadata: { campaignId: ce.campaignId, campaignEmailId: ce._id },
      });

      await updateLeadScore(ce.leadId);
    } catch (err) {
      console.error("[TrackPixel] Post-pixel processing failed:", err.message);
    }
  });
});

export const trackLinkClick = asyncCatch(async (req, res) => {
  const { dest } = req.query;
  const { campaignEmailId } = req.params;

  if (!dest) return res.status(400).send("Missing destination");

  let destUrl;
  try {
    destUrl = new URL(dest);
  } catch {
    return res.status(400).send("Invalid destination URL");
  }

  if (!["http:", "https:"].includes(destUrl.protocol)) {
    return res.status(400).send("Invalid destination protocol");
  }

  res.redirect(302, destUrl.href);

  setImmediate(async () => {
    try {
      const ce = await recordLinkClick(campaignEmailId);
      if (!ce) return;

      await logActivity({
        leadId: ce.leadId,
        tenantId: ce.tenantId,
        type: "link_clicked",
        description: "Lead clicked a link in a campaign email",
        metadata: {
          campaignId: ce.campaignId,
          campaignEmailId: ce._id,
          url: destUrl.href,
        },
      });

      await updateLeadScore(ce.leadId);
    } catch (err) {
      console.error(
        "[TrackLink] Post-redirect processing failed:",
        err.message,
      );
    }
  });
});
