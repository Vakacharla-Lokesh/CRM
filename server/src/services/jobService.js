import redis from "../config/redis.js";
import crypto from "crypto";

// TTL for job records in Redis (30 days in seconds)
const JOB_TTL = 30 * 24 * 60 * 60;

function getJobKey(jobId, tenantId) {
  return `job:${tenantId}:${jobId}`;
}

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

    // Store job in Redis with TTL
    await redis.hset(jobKey, jobData);
    await redis.expire(jobKey, JOB_TTL);

    return jobData;
  },

  async getJob(jobId, tenantId) {
    const jobKey = getJobKey(jobId, tenantId.toString());
    const job = await redis.hgetall(jobKey);

    // Return null if job doesn't exist, otherwise transform numeric fields
    if (!job || Object.keys(job).length === 0) {
      return null;
    }

    return {
      jobId: job.jobId,
      tenantId: job.tenantId,
      type: job.type,
      status: job.status,
      progress: parseInt(job.progress, 10),
      result: job.result ? JSON.parse(job.result) : undefined,
      error: job.error ? JSON.parse(job.error) : undefined,
      createdAt: parseInt(job.createdAt, 10),
      updatedAt: parseInt(job.updatedAt, 10),
    };
  },

  async updateJob(jobId, tenantId, updates) {
    const { status, progress, result, error } = updates;
    const now = Date.now();

    const jobKey = getJobKey(jobId, tenantId.toString());

    // Prepare update object
    const updateData = {
      updatedAt: now,
    };

    if (status !== undefined) {
      updateData.status = status;
    }

    if (progress !== undefined) {
      updateData.progress = progress;
    }

    if (result !== undefined) {
      updateData.result = JSON.stringify(result);
    }

    if (error !== undefined) {
      updateData.error = JSON.stringify(error);
    }

    // Update job in Redis
    await redis.hset(jobKey, updateData);
    await redis.expire(jobKey, JOB_TTL);

    // Return updated job
    return this.getJob(jobId, tenantId);
  },
};
