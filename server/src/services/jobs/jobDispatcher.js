import crypto from "crypto";
import { queueService } from "../aws/queue/queueService.js";
import { isValidJobType } from "../../utils/jobTypes.js";
import { jobService } from "../../modules/jobs/services/jobService.js";

async function dispatch({ jobType, payload, tenantId, userId }) {
  if (!jobType) {
    throw new Error("[JobDispatcher] jobType is required");
  }

  if (!isValidJobType(jobType)) {
    throw new Error(`[JobDispatcher] Unknown job type: "${jobType}"`);
  }

  if (!tenantId) {
    throw new Error("[JobDispatcher] tenantId is required for job dispatch");
  }

  const job = await jobService.createJob({
    tenantId,
    type: jobType,
    status: "pending",
  });

  const requestId = crypto.randomUUID();
  const traceId = crypto.randomUUID();

  const enrichedPayload = {
    ...payload,
    _meta: {
      jobType,
      jobId: job.jobId,
      tenantId,
      userId: userId || null,
      requestId,
      traceId,
      dispatchedAt: new Date().toISOString(),
    },
  };

  const messageId = await queueService.enqueueJob(
    jobType,
    enrichedPayload,
    tenantId,
  );

  console.log(
    `[JobDispatcher] Dispatched job: ${jobType} (jobId: ${job.jobId}, message: ${messageId})`,
  );

  return { messageId, requestId, traceId, jobId: job.jobId };
}

export const jobDispatcher = {
  dispatch,
};

export default jobDispatcher;
