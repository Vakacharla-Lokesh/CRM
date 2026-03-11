import { jobCache } from "../../../config/cache.js";
import crypto from "crypto";

const JOB_TTL = 30 * 24 * 60 * 60;

function getJobKey(jobId, tenantId) {
  return `job:${tenantId}:${jobId}`;
}

const safeParse = (val) => {
  if (!val) return null;
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
};

export const jobService = {
  async createJob({ tenantId, type, status = "pending" }) {
    const jobId = crypto.randomUUID();
    const now = Date.now();

    const jobData = {
      jobId,
      tenantId: tenantId.toString(),
      type,
      status,
      progress: 0,
      createdAt: now,
      updatedAt: now,
    };

    const jobKey = getJobKey(jobId, tenantId.toString());
    await jobCache.set(jobKey, JSON.stringify(jobData), JOB_TTL);

    return jobData;
  },

  async getJob(jobId, tenantId) {
    const jobKey = getJobKey(jobId, tenantId.toString());
    const raw = await jobCache.get(jobKey);
    return safeParse(raw);
  },

  async updateJob(jobId, tenantId, updates) {
    const jobKey = getJobKey(jobId, tenantId.toString());
    const raw = await jobCache.get(jobKey);
    const existing = safeParse(raw);

    if (!existing) {
      console.warn(`[JobService] updateJob: job not found`, {
        jobId,
        tenantId,
      });
      return null;
    }

    const updated = {
      ...existing,
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.progress !== undefined && { progress: updates.progress }),
      ...(updates.result !== undefined && { result: updates.result }),
      ...(updates.error !== undefined && { error: updates.error }),
      updatedAt: Date.now(),
    };

    await jobCache.set(jobKey, JSON.stringify(updated), JOB_TTL);
    return updated;
  },
};
