import leadModel from "../models/leadModel.js";
import { getActivitiesByLead } from "../services/leadActivityService.js";
import asyncCatch from "../../../utils/asyncCatch.js";
import AppError from "../../../utils/appError.js";

export const getLeadActivities = asyncCatch(async (req, res) => {
  const tenantFilter = req.tenantFilter || {};

  const lead = await leadModel
    .findOne({ _id: req.params.id, ...tenantFilter })
    .lean();

  if (!lead) throw new AppError("Lead not found", 404);

  const activities = await getActivitiesByLead(req.params.id);

  res.json({ count: activities.length, activities });
});
