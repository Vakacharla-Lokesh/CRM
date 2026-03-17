import asyncCatch from "../../../utils/asyncCatch.js";
import * as analyticsService from "../services/analyticsService.js";
import mongoose from "mongoose";

export {
  getLeadTrends,
  getLeadStatusBreakdown,
  getLeadScoreDistribution,
} from "./leadAnalyticsController.js";

export {
  getDealPipeline,
  getDealTrends,
} from "./dealAnalyticsController.js";

export {
  getOrganizationStats,
  getTopOrganizations,
} from "./organizationController.js";

export const getDashboardStats = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    req.auth?.permissions?.includes("analytics:view_all");

  const tenantBase = req.tenantFilter || {};
  const dealFilter = { ...tenantBase };
  let leadFilter = { ...tenantBase };

  if (!canViewAll) {
    const userObjectId = new mongoose.Types.ObjectId(req.auth.userId);
    leadFilter = {
      ...tenantBase,
      $or: [{ assignedTo: userObjectId }, { createdBy: userObjectId }],
    };
    dealFilter.userId = userObjectId;
  }

  const response = await analyticsService.getDashboardStats(
    req.auth.userId,
    leadFilter,
    dealFilter,
  );

  res.json(response);
});
