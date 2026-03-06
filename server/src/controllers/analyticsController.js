import asyncCatch from "../utils/asyncCatch.js";
import * as analyticsService from "../services/analyticsService.js";
import mongoose from "mongoose";

export {
  getLeadTrends,
  getLeadStatusBreakdown,
  getLeadScoreDistribution,
} from "./analytics/leadAnalyticsController.js";

export {
  getDealPipeline,
  getDealTrends,
} from "./analytics/dealAnalyticsController.js";

export {
  getOrganizationStats,
  getTopOrganizations,
} from "./analytics/organizationController.js";

export const getDashboardStats = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    req.auth?.permissions?.includes("analytics:view_all");

  const leadFilter = req.tenantFilter || {};
  const dealFilter = req.tenantFilter || {};

  if (!canViewAll) {
    leadFilter.assignedTo = new mongoose.Types.ObjectId(req.auth.userId);
    dealFilter.userId = new mongoose.Types.ObjectId(req.auth.userId);
  }

  const response = await analyticsService.getDashboardStats(
    req.auth.userId,
    leadFilter,
    dealFilter,
  );

  res.json(response);
});
