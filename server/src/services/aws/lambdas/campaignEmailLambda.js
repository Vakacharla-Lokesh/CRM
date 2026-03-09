import emailController from "../../../controllers/emailController.js";
import { Campaign, CampaignEmail } from "../../../models/campaignModel.js";
import { JOB_TYPES } from "../../../utils/jobTypes.js";
import { logger } from "../../../utils/logger.js";

export const jobType = JOB_TYPES.CAMPAIGN_EMAIL_SEND;

const TRACKING_BASE_URL =
  process.env.API_BASE_URL || "http://localhost:5000/api";

export async function handler(payload, _context) {
  const { campaignEmailId, campaignId, leadId } = payload;

  logger.info("[CampaignEmailLambda] Processing", { campaignEmailId });

  const ce = await CampaignEmail.findById(campaignEmailId);
  if (!ce) {
    logger.warn("[CampaignEmailLambda] CampaignEmail not found, skipping", {
      campaignEmailId,
    });
    return {
      success: true,
      shouldRetry: false,
      message: "Record not found, skipped",
    };
  }

  if (ce.status !== "pending") {
    return {
      success: true,
      shouldRetry: false,
      message: `Skipped: status=${ce.status}`,
    };
  }

  const campaign = await Campaign.findById(campaignId).lean();
  if (!campaign) {
    ce.status = "failed";
    await ce.save();
    return {
      success: false,
      shouldRetry: false,
      message: "Campaign not found",
    };
  }

  const pixelUrl = `${TRACKING_BASE_URL}/campaigns/track/${campaignEmailId}`;
  const trackedHtml = `
    ${campaign.body}
    <img src="${pixelUrl}" width="1" height="1" style="display:none;" alt="" />
  `;

  try {
    await emailController.sendEmail({
      to: ce.toEmail,
      subject: campaign.subject,
      html: trackedHtml,
      text: campaign.body.replace(/<[^>]*>/g, ""),
    });

    ce.status = "sent";
    ce.sentAt = new Date();
    await ce.save();

    await Campaign.findByIdAndUpdate(campaignId, { $inc: { sentCount: 1 } });

    logger.info("[CampaignEmailLambda] Email sent", {
      campaignEmailId,
      to: ce.toEmail,
    });
    return {
      success: true,
      shouldRetry: false,
      message: `Sent to ${ce.toEmail}`,
    };
  } catch (err) {
    logger.error("[CampaignEmailLambda] Send failed", {
      campaignEmailId,
      error: err.message,
    });

    ce.status = "failed";
    await ce.save();

    return { success: false, shouldRetry: true, message: err.message };
  }
}
