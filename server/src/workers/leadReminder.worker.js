import { subDays, startOfDay, endOfDay } from "date-fns";
import LeadModel from "../../models/leadModel.js";
import emailController from "../../controllers/emailController.js";
import { JOB_TYPES } from "../modules/jobs/job.types.js";

export const jobType = JOB_TYPES.LEAD_REMINDER;

export async function handler(_payload, context) {
  const { tenantId } = context;

  console.log(
    `[LeadReminderWorker] Running lead reminder (tenant: ${tenantId})`,
  );

  try {
    const targetDate = subDays(new Date(), 14);
    const start = startOfDay(targetDate);
    const end = endOfDay(targetDate);

    const leads = await LeadModel.find({
      status: "new",
      createdAt: { $gte: start, $lte: end },
    })
      .populate("userId", "email firstName")
      .lean();

    let sentCount = 0;

    for (const lead of leads) {
      if (!lead.userId?.email) continue;

      const leadName = `${lead.firstName} ${lead.lastName || ""}`.trim();

      await emailController.sendLeadReminderMail({
        _id: lead._id,
        to: lead.userId.email,
        userName: lead.userId.firstName,
        leadName,
      });

      sentCount++;
    }

    console.log(`[LeadReminderWorker] Sent ${sentCount} reminder email(s).`);

    return {
      success: true,
      shouldRetry: false,
      message: `Sent ${sentCount} lead reminder emails`,
    };
  } catch (error) {
    console.error("[LeadReminderWorker] Error:", error);
    return {
      success: false,
      shouldRetry: true,
      message: error.message,
    };
  }
}
