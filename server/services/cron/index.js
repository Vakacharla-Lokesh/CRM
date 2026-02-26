import cron from "node-cron";
import { runLeadReminderJob } from "./leadReminderJob.js";

// ─── Job definitions ──────────────────────────────────────────────────────────
// Each entry: { name, schedule (cron expression), fn }

const JOBS = [
  {
    name: "LeadReminderJob",
    schedule: "0 10 * * *", // Every day at 10:00 AM
    fn: runLeadReminderJob,
  },
];

// ─── Bootstrap ────────────────────────────────────────────────────────────────

/**
 * Registers and starts all cron jobs.
 * Call this once from index.js after the server is listening.
 */
export function startAllCronJobs() {
  console.log("[Cron] Registering cron jobs...");

  for (const { name, schedule, fn } of JOBS) {
    cron.schedule(schedule, async () => {
      console.log(`[Cron] ▶ Running job: ${name}`);
      try {
        await fn();
      } catch (error) {
        console.error(`[Cron] ✗ Job failed: ${name}`, error);
      }
    });

    console.log(`[Cron] ✓ Scheduled: ${name} (${schedule})`);
  }

  console.log(`[Cron] ${JOBS.length} job(s) scheduled.`);
}
