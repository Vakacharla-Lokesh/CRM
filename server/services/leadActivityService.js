import leadActivityModel from "../models/leadActivityModel.js";

/**
 * Reusable service to log a lead activity entry.
 *
 * @param {Object} params
 * @param {string|import('mongoose').Types.ObjectId} params.leadId
 * @param {string|import('mongoose').Types.ObjectId} [params.tenantId]
 * @param {string} params.type - Activity type constant (e.g. "CREATED")
 * @param {string} [params.description] - Human-readable summary
 * @param {Object} [params.metadata] - Optional structured details
 * @param {string|import('mongoose').Types.ObjectId} [params.userId] - User who triggered the action
 */
export const logActivity = async ({
  leadId,
  tenantId,
  type,
  description,
  metadata,
  userId,
}) => {
  await leadActivityModel.create({
    leadId,
    tenantId: tenantId || undefined,
    type,
    description,
    metadata: metadata || {},
    createdBy: userId || undefined,
  });
};

/**
 * Fetch all activities for a given lead, sorted newest first.
 *
 * @param {string|import('mongoose').Types.ObjectId} leadId
 * @returns {Promise<Array>}
 */
export const getActivitiesByLead = async (leadId) => {
  return leadActivityModel
    .find({ leadId })
    .sort({ createdAt: -1 })
    .populate("createdBy", "firstName lastName")
    .lean();
};
