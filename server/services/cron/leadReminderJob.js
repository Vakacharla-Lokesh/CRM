import { subDays, startOfDay, endOfDay } from "date-fns";
import LeadModel from "../../models/leadModel.js";
import emailController from "../../controllers/emailController.js";

/**
 * Finds leads that have been in "new" status for 14+ days and sends
 * a reminder email to the assigned user.
 */
export async function runLeadReminderJob() {
  console.log("[LeadReminderJob] Running...");

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

    console.log(`[LeadReminderJob] Sent ${sentCount} reminder email(s).`);
  } catch (error) {
    console.error("[LeadReminderJob] Error:", error);
  }
}
