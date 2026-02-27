import { jobService } from "../services/jobService.js";

export const getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;

    const tenantId = req.user?.tenantId || req.query.tenantId;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: "tenantId is required to query job state",
      });
    }

    const job = await jobService.getJob(jobId, tenantId);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    return res.status(200).json({ success: true, data: job });
  } catch (error) {
    console.error("[JobController] Error fetching job:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
