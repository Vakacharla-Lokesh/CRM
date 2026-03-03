import leadModel from "../models/leadModel.js";
import { getActivitiesByLead } from "../services/leadActivityService.js";
import asyncCatch from "../utils/asyncCatch.js";
import AppError from "../utils/appError.js";

export const getLeadActivities = asyncCatch(async (req, res) => {
  const lead = await leadModel.findById(req.params.id).lean();

  if (!lead) throw new AppError("Lead not found", 404);

  if (
    req.user.role !== "super_admin" &&
    lead.tenantId.toString() !== req.user.tenantId
  ) {
    throw new AppError("Forbidden: You cannot access this lead", 403);
  }

  const activities = await getActivitiesByLead(req.params.id);

  res.json({ count: activities.length, activities });
});
