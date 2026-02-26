import cron from "node-cron";
import { subDays, startOfDay, endOfDay } from "date-fns";
import LeadModel from "../models/leadModel.js";
import emailController from "../controllers/emailController.js";

export async function runLeadReminderJob() {
  try {
    const targetDate = subDays(new Date(), 14);
    const start = startOfDay(targetDate);
    const end = endOfDay(targetDate);

    const leads = await LeadModel.find({
      status: "new",
      createdAt: { $gte: start, $lte: end },
    }).populate("userId");

    let sentCount = 0;

    for (const lead of leads) {
      if (lead.userId && lead.userId.email) {
        const leadName = `${lead.firstName} ${lead.lastName || ""}`.trim();

        await emailController.sendLeadReminderMail({
          _id: lead._id,
          to: lead.userId.email,
          userName: lead.userId.firstName,
          leadName,
        });

        sentCount++;
      }
    }

    console.log(`Successfully sent ${sentCount} lead reminder emails.`);
  } catch (error) {
    console.error("Error in lead reminder job:", error);
  }
}

export function startLeadReminderJob() {
  cron.schedule("0 10 * * *", async () => {
    await runLeadReminderJob();
  });
}
