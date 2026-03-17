import express from "express";
import { getJobStatus } from "../controllers/jobController.js";
import { authenticateRequest, checkActive } from "../../../middlewares/auth.js";

const router = express.Router();

router.get("/:jobId", authenticateRequest, checkActive, getJobStatus);

export default router;
