import leadModel from "../models/leadModel.js";
import organizationModel from "../models/organizationModel.js";
import commentModel from "../models/commentModel.js";
import callModel from "../models/callModel.js";
import attachmentModel from "../models/attachmentModel.js";

function scoreLead(lead) {
  let score = 0;
  score += (lead.comments || 0) * 4;

  if (lead.organization_size >= 100) score += 10;
  if (lead.organization_size >= 500) score += 10;

  if (
    lead.lead_email &&
    !lead.lead_email.includes("gmail.com") &&
    !lead.lead_email.includes("hotmail.com")
  ) {
    score += 5;
  }

  score += (lead.calls || 0) * 3;

  score += (lead.attachments || 0) * 2;

  if (lead.lead_status === "Converted") {
    score += 20;
  } else if (lead.lead_status === "Follow-Up") {
    score += 10;
  } else if (lead.lead_status === "Dead") {
    score = Math.max(0, score - 15);
  }

  if (lead.created_on) {
    const daysSinceCreation =
      (Date.now() - new Date(lead.created_on).getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysSinceCreation <= 30) {
      score += 5;
    }
  }

  return Math.max(0, score);
}

export async function updateLeadScore(leadId) {
  try {
    const lead = await leadModel.findById(leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    let organizationSize = 0;
    if (lead.organizationId) {
      const organization = await organizationModel.findById(
        lead.organizationId,
      );
      if (organization) {
        organizationSize = organization.organizationSize || 0;
      }
    }

    const commentsCount = await commentModel.countDocuments({ leadId });
    const callsCount = await callModel.countDocuments({ leadId });
    const attachmentsCount = await attachmentModel.countDocuments({ leadId });

    const leadData = {
      comments: commentsCount,
      organization_size: organizationSize,
      lead_email: lead.email,
      calls: callsCount,
      attachments: attachmentsCount,
      lead_status: lead.status,
      created_on: lead.createdAt,
    };

    const newScore = scoreLead(leadData);

    await leadModel.findByIdAndUpdate(leadId, { score: newScore });

    return newScore;
  } catch (error) {
    console.error(`Error updating lead score for leadId ${leadId}:`, error);
    throw error;
  }
}
