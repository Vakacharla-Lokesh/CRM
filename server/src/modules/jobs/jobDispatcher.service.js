import crypto from "crypto";
import { queueService } from "../../services/aws/queue/queue.service.js";
import { isValidJobType } from "./job.types.js";

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

  const requestId = crypto.randomUUID();
  const traceId = crypto.randomUUID();

  const enrichedPayload = {
    ...payload,
    _meta: {
      jobType,
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
    `[JobDispatcher] Dispatched job: ${jobType} (message: ${messageId}, request: ${requestId})`,
  );

  return { messageId, requestId, traceId };
}

export const jobDispatcher = {
  dispatch,
};

export default jobDispatcher;
