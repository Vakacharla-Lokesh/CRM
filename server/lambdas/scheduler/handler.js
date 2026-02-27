import { jobService } from "../../services/jobService.js";
import { jobDispatcher } from "../../src/modules/jobs/jobDispatcher.service.js";
import { JOB_TYPES } from "../../src/modules/jobs/job.types.js";

export const handler = async (event, _context) => {
  console.log("[Scheduler] Event received:", JSON.stringify(event));

  try {
    const tenantId = event.detail?.tenantId || "system-scheduler";

    const job = await jobService.createJob({
      tenantId,
      type: "scheduled_sync",
      status: "pending",
    });

    console.log(`[Scheduler] Created job: ${job.jobId}`);

    const payload = {
      jobId: job.jobId,
      tenantId: job.tenantId,
      type: "scheduled_sync",
      timestamp: new Date().toISOString(),
    };

    const { messageId } = await jobDispatcher.dispatch({
      jobType: JOB_TYPES.SCHEDULED_SYNC,
      payload,
      tenantId: job.tenantId,
    });

    console.log(
      `[Scheduler] Enqueued job: ${job.jobId} (message: ${messageId})`,
    );

    return { statusCode: 200, body: "Success" };
  } catch (err) {
    console.error(`[Scheduler] Handler error:`, err);
    throw err;
  }
};
