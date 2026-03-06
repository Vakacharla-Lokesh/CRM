import { asyncCatch } from "../utils/asyncCatch.js";
import AppError from "../utils/appError.js";
import { jobService } from "../services/jobService.js";

export const getJobStatus = asyncCatch(async (req, res) => {
  const { jobId } = req.params;
  const tenantId = req.user?.tenantId || req.tenantId;

  const job = await jobService.getJob(jobId, tenantId);

  if (!job) {
    throw new AppError("Job not found or expired", 404);
  }

  res.status(200).json({ success: true, job });
});
