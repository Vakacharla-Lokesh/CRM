import { Campaign, CampaignEmail } from "../models/campaignModel.js";
import leadModel from "../../leads/models/leadModel.js";
import AppError from "../../../utils/appError.js";
import { jobDispatcher } from "../../../services/jobs/jobDispatcher.js";
import { JOB_TYPES } from "../../../utils/jobTypes.js";
import emailController from "../../emails/controllers/emailController.js";
import { logActivity } from "../../leads/services/leadActivityService.js";
import { updateLeadScore } from "../../../utils/leadScoreUtils.js";
import { queueService } from "../../../services/aws/queue/queueService.js";
import { marked } from "marked";
import { wrapServiceFn } from "../../../utils/serviceWrapper.js";

const TRACKING_BASE_URL =
  process.env.API_BASE_URL || "http://localhost:4000/api";

function wrapLinksWithTracking(html, campaignEmailId) {
  return html.replace(/href="(https?:\/\/[^"]+)"/g, (_, url) => {
    const encoded = encodeURIComponent(url);
    return `href="${TRACKING_BASE_URL}/campaigns/link/${campaignEmailId}?dest=${encoded}"`;
  });
}

function isCampaignQueueAvailable() {
  try {
    queueService.getQueueUrl("campaignEmails");
    return true;
  } catch {
    return false;
  }
}

async function sendCampaignEmailDirect(ce, campaign) {
  const pixelUrl = `${TRACKING_BASE_URL}/campaigns/track/${ce._id}`;
  let htmlBody = await marked.parse(campaign.body);
  htmlBody = wrapLinksWithTracking(htmlBody, ce._id);
  const trackedHtml = `${htmlBody}<img src="${pixelUrl}" width="1" height="1" style="display:none;" alt="" />`;

  try {
    await emailController.sendEmail({
      to: ce.toEmail,
      subject: campaign.subject,
      html: trackedHtml,
      text: campaign.body,
    });

    ce.status = "sent";
    ce.sentAt = new Date();
    await ce.save();

    await Campaign.findByIdAndUpdate(campaign._id, { $inc: { sentCount: 1 } });
  } catch (err) {
    ce.status = "failed";
    await ce.save();
    console.error(
      `[CampaignService] Direct send failed for ${ce._id}:`,
      err.message,
    );
  }
}

export const createAndDispatchCampaign = wrapServiceFn(
  async ({ tenantId, userId, subject, body, leadIds }) => {
    if (!leadIds?.length)
      throw new AppError("At least one lead is required", 400);

    const leads = await leadModel
      .find({ _id: { $in: leadIds }, tenantId })
      .select("_id email firstName")
      .lean();

    const validLeads = leads.filter((l) => !!l.email);
    if (!validLeads.length)
      throw new AppError("No leads with valid email addresses", 400);

    const campaign = await Campaign.create({
      tenantId,
      createdBy: userId,
      subject,
      body,
      status: "queued",
      totalRecipients: validLeads.length,
    });

    const campaignEmailDocs = validLeads.map((lead) => ({
      campaignId: campaign._id,
      leadId: lead._id,
      tenantId,
      toEmail: lead.email,
      status: "pending",
    }));

    const inserted = await CampaignEmail.insertMany(campaignEmailDocs);

    if (isCampaignQueueAvailable()) {
      console.log("[CampaignService] SQS available — dispatching to queue");
      const dispatchPromises = inserted.map((ce) =>
        jobDispatcher.dispatch({
          jobType: JOB_TYPES.CAMPAIGN_EMAIL_SEND,
          tenantId: tenantId.toString(),
          userId: userId.toString(),
          payload: {
            campaignEmailId: ce._id.toString(),
            campaignId: campaign._id.toString(),
            leadId: ce.leadId.toString(),
            tenantId: tenantId.toString(),
          },
        }),
      );
      await Promise.all(dispatchPromises);
    } else {
      for (const ce of inserted) {
        await sendCampaignEmailDirect(ce, campaign);
      }
      await Campaign.findByIdAndUpdate(campaign._id, { status: "completed" });
    }

    return Campaign.findById(campaign._id).lean();
  },
);

export const processAllPendingEmails = wrapServiceFn(async () => {
  const pendingEmails = await CampaignEmail.find({ status: "pending" }).lean();

  if (!pendingEmails.length) {
    console.log("[CampaignService] No pending campaign emails to recover");
    return;
  }

  console.log(
    `[CampaignService] Recovering ${pendingEmails.length} pending campaign email(s)`,
  );

  const campaignIds = [
    ...new Set(pendingEmails.map((ce) => ce.campaignId.toString())),
  ];
  const campaigns = await Campaign.find({ _id: { $in: campaignIds } }).lean();
  const campaignMap = new Map(campaigns.map((c) => [c._id.toString(), c]));

  for (const ceData of pendingEmails) {
    const campaign = campaignMap.get(ceData.campaignId.toString());
    if (!campaign) continue;

    const ce = await CampaignEmail.findById(ceData._id);
    if (!ce || ce.status !== "pending") continue;

    await sendCampaignEmailDirect(ce, campaign);
  }

  console.log("[CampaignService] Pending email recovery complete");
});

export const recordEmailOpen = wrapServiceFn(async (campaignEmailId) => {
  const ce = await CampaignEmail.findById(campaignEmailId);
  if (!ce || ce.status === "opened") return;

  ce.status = "opened";
  ce.openedAt = new Date();
  await ce.save();

  await Campaign.findByIdAndUpdate(ce.campaignId, { $inc: { openCount: 1 } });

  return ce;
});

export const getCampaigns = wrapServiceFn(async (tenantId) => {
  return Campaign.find({ tenantId }).sort({ createdAt: -1 }).lean();
});

export const getCampaignById = wrapServiceFn(async (campaignId, tenantId) => {
  const campaign = await Campaign.findOne({ _id: campaignId, tenantId }).lean();
  if (!campaign) throw new AppError("Campaign not found", 404);
  return campaign;
});

export const recordLinkClick = wrapServiceFn(async (campaignEmailId) => {
  const ce = await CampaignEmail.findByIdAndUpdate(
    campaignEmailId,
    { $inc: { linkClickCount: 1 } },
    { new: true },
  ).lean();
  if (!ce) return null;

  await Campaign.findByIdAndUpdate(ce.campaignId, {
    $inc: { linkClickCount: 1 },
  });

  return ce;
});
