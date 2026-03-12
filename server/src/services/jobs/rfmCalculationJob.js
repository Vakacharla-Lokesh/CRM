import { runRfmSegmentation } from "../../services/rfmSegmentationService.js";
import logger from "../../utils/logger.js";
import { JOB_TYPES } from "../../utils/jobTypes.js";

async function processLeadRfmCalculation() {
  logger.info("[RFM Job] Starting scheduled global RFM calculation...");
  try {
    const result = await runRfmSegmentation(null);
    return {
      success: result.success,
      shouldRetry: false,
      message: result.message,
    };
  } catch (error) {
    logger.error("[RFM Job] Failed", error);
    return { success: false, shouldRetry: true, message: error.message };
  }
}

export const jobType = JOB_TYPES.LEAD_RFM_CALCULATION;
export const handler = processLeadRfmCalculation;
