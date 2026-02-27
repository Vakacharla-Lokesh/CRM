import leadActivityModel from "../models/leadActivityModel.js";

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

export const getActivitiesByLead = async (leadId) => {
  return leadActivityModel
    .find({ leadId })
    .sort({ createdAt: -1 })
    .populate("createdBy", "firstName lastName")
    .lean();
};
