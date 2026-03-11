import Lead from "../../modules/leads/models/leadModel.js";
import Deal from "../../modules/deals/models/dealModel.js";
import Call from "../../modules/calls/models/callModel.js";
import Comment from "../../modules/comments/models/commentModel.js";
import LeadActivity from "../../modules/leads/models/leadActivityModel.js";
import logger from "../../utils/logger.js";
import { JOB_TYPES } from "../../utils/jobTypes.js";

const BATCH_SIZE = 500;

function calculateQuintileScore(value, sortedArray) {
  if (!sortedArray.length || value === 0) return 1;
  const index = sortedArray.indexOf(value);
  const percentile = index / sortedArray.length;

  if (percentile >= 0.8) return 5;
  if (percentile >= 0.6) return 4;
  if (percentile >= 0.4) return 3;
  if (percentile >= 0.2) return 2;
  return 1;
}

function determineSegment(r, f, m) {
  if (r >= 4 && f >= 4 && m >= 4) return "Hot Deals";
  if (r <= 2 && f <= 2 && m >= 4) return "Sleeping Giants";
  if (r >= 4 && f >= 4 && m <= 2) return "Time Wasters";
  if (r <= 2 && f <= 2 && m <= 2) return "Dead Wood";
  return "Active Prospect";
}

async function processLeadRfmCalculation() {
  logger.info("[RFM Job] Starting Daily Engagement RFM Calculation...");
  try {
    const totalLeads = await Lead.countDocuments({ status: { $ne: "Dead" } });
    let processed = 0;

    const allMetrics = [];

    for (let skip = 0; skip < totalLeads; skip += BATCH_SIZE) {
      const leads = await Lead.find({ status: { $ne: "Dead" } })
        .skip(skip)
        .limit(BATCH_SIZE)
        .lean();

      const batchPromises = leads.map(async (lead) => {
        const leadId = lead._id;

        const deal = await Deal.findOne({ leadId }).lean();
        const dealValue = deal ? deal.value : 0;

        const [calls, comments, activities] = await Promise.all([
          Call.find({ leadId }).select("createdAt").lean(),
          Comment.find({ leadId }).select("createdAt").lean(),
          LeadActivity.find({ leadId }).select("createdAt").lean(),
        ]);

        const allTouchpoints = [...calls, ...comments, ...activities].map((t) =>
          new Date(t.createdAt).getTime(),
        );
        const engagementCount = allTouchpoints.length;

        let lastTouchpoint = null;
        let daysSinceLastTouch = 999;

        if (engagementCount > 0) {
          const maxTimestamp = Math.max(...allTouchpoints);
          lastTouchpoint = new Date(maxTimestamp);
          daysSinceLastTouch = Math.floor(
            (Date.now() - maxTimestamp) / (1000 * 60 * 60 * 24),
          );
        }

        allMetrics.push({
          leadId,
          dealValue,
          engagementCount,
          daysSinceLastTouch,
          lastTouchpoint,
        });
      });

      await Promise.all(batchPromises);
      processed += leads.length;
      logger.info(
        `[RFM Job] Fetched raw metrics for ${processed}/${totalLeads} leads.`,
      );
    }

    const sortedM = [...allMetrics]
      .map((m) => m.dealValue)
      .sort((a, b) => a - b);
    const sortedF = [...allMetrics]
      .map((m) => m.engagementCount)
      .sort((a, b) => a - b);
    const sortedR = [...allMetrics]
      .map((m) => m.daysSinceLastTouch)
      .sort((a, b) => b - a);

    const bulkOps = allMetrics.map((metrics) => {
      const mScore = calculateQuintileScore(metrics.dealValue, sortedM);
      const fScore = calculateQuintileScore(metrics.engagementCount, sortedF);
      const rScore = calculateQuintileScore(
        metrics.daysSinceLastTouch,
        sortedR,
      );

      const segment = determineSegment(rScore, fScore, mScore);

      return {
        updateOne: {
          filter: { _id: metrics.leadId },
          update: {
            $set: {
              "rfm.rScore": rScore,
              "rfm.fScore": fScore,
              "rfm.mScore": mScore,
              "rfm.segment": segment,
              "rfm.lastTouchpoint": metrics.lastTouchpoint,
              "rfm.engagementCount": metrics.engagementCount,
              "rfm.dealValue": metrics.dealValue,
            },
          },
        },
      };
    });

    if (bulkOps.length > 0) {
      await Lead.bulkWrite(bulkOps);
    }

    logger.info(
      `[RFM Job] Successfully updated RFM segments for ${bulkOps.length} leads.`,
    );
    return {
      success: true,
      shouldRetry: false,
      message: `Updated RFM for ${bulkOps.length} leads.`,
    };
  } catch (error) {
    logger.error("[RFM Job] Failed to calculate RFM scores", error);
    return { success: false, shouldRetry: true, message: error.message };
  }
}

export const jobType = JOB_TYPES.LEAD_RFM_CALCULATION;
export const handler = processLeadRfmCalculation;