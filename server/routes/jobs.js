import { Router } from "express";
import { getJobStatus } from "../controllers/jobController.js";
// Import authentication middleware if required
// import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Endpoint for checking the current progress and status of a DynamoDB-tracked job.
// Consider adding auth middleware: router.get("/:jobId", requireAuth, getJobStatus);
router.get("/:jobId", getJobStatus);

export default router;
