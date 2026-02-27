import { jobService } from "../services/jobService.js";

/**
 * Handle HTTP GET request to check a job's status.
 * Route: GET /api/jobs/:jobId
 * Note: Assumes tenant isolation; frontend should provide tenantId in req.user or query.
 */
export const getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;

    // In a real application with auth middleware, tenantId should come from req.user
    // For now, depending on the structure, we'll try to get it from query params
    const tenantId = req.user?.tenantId || req.query.tenantId;

    if (!tenantId) {
      return res
        .status(400)
        .json({
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
