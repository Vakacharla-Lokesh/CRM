import { jobService } from "../../services/jobService.js";
import { sqsManager } from "../../services/aws/sqsManager.js";
import { QUEUES } from "../../services/aws/initAwsResources.js";

/**
 * EventBridge Scheduler Lambda Handler
 * This executes at configured intervals (e.g., cron)
 * to trigger necessary backend processes like scheduled exports.
 */
export const handler = async (event, _context) => {
  console.log("[Scheduler] Event received:", JSON.stringify(event));

  try {
    // Determine action based on EventBridge event details, or just perform scheduled sweep
    // Example: process scheduled regular tasks, create jobs, enqueue them.

    // As an example, create a scheduled sync job
    const tenantId = event.detail?.tenantId || "system-scheduler";

    // 1. Create a tracking job in DynamoDB
    const job = await jobService.createJob({
      tenantId,
      type: "scheduled_sync",
      status: "pending",
    });

    console.log(`[Scheduler] Created job: ${job.jobId}`);

    // 2. Enqueue the task to SQS for processing
    const payload = {
      jobId: job.jobId,
      tenantId: job.tenantId,
      type: "scheduled_sync",
      timestamp: new Date().toISOString(),
    };

    // Wait, the offlineWrites queue is used as an example, update this based on logic
    await sqsManager.sendMessage(QUEUES.offlineWrites, payload);

    console.log(`[Scheduler] Enqueued job: ${job.jobId}`);

    return { statusCode: 200, body: "Success" };
  } catch (err) {
    console.error(`[Scheduler] Handler error:`, err);
    throw err;
  }
};
