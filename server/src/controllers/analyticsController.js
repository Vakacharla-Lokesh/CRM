import leadModel from "../models/leadModel.js";
import dealModel from "../models/dealModel.js";
import organizationModel from "../models/organizationModel.js";
import asyncCatch from "../utils/asyncCatch.js";
import { periodDates, pctChange } from "../utils/dateFormat.js";
import { dashboardCache } from "../config/cache.js";
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
    (Array.isArray(req.auth?.permissions) && req.auth.permissions.includes("leads:view_all"));

  const leadFilter = req.tenantFilter || {};
  const dealFilter = req.tenantFilter || {};
  
  if (!canViewAll) {
    leadFilter.assignedTo = req.auth.userId;
    dealFilter.userId = req.auth.userId;
  }

  const cacheKey = `dashboard_stats_${req.auth.userId}`;

  // Check cache first
  const cachedData = await dashboardCache.get(cacheKey);
  if (cachedData) {
    return res.json(JSON.parse(cachedData));
  }

  const { currentStart, currentEnd, previousStart, previousEnd } =
    periodDates(30);

  const leadMatchFilter = { ...leadFilter };
  const dealMatchFilter = { ...dealFilter };

  const [
    leadSummary,
    dealSummary,
    sourceSummary,
    previousLeadSummary,
    previousDealSummary,
    previousLeadSourceSummary,
    orgCount,
  ] = await Promise.all([
    leadModel.aggregate([
      { $match: leadMatchFilter },
      {
        $facet: {
          total: [{ $count: "count" }],
          converted: [{ $match: { status: "Converted" } }, { $count: "count" }],
          currentPeriod: [
            {
              $match: {
                createdAt: { $gte: currentStart, $lte: currentEnd },
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]),

    dealModel.aggregate([
      { $match: dealMatchFilter },
      {
        $facet: {
          wonRevenue: [
            { $match: { status: "Won" } },
            { $group: { _id: null, total: { $sum: "$value" } } },
          ],
          currentPeriodWon: [
            {
              $match: {
                status: "Won",
                updatedAt: { $gte: currentStart, $lte: currentEnd },
              },
            },
            { $group: { _id: null, total: { $sum: "$value" } } },
          ],
          totalDeals: [{ $count: "count" }],
          openDeals: [
            {
              $match: {
                status: {
                  $in: [
                    "Prospecting",
                    "Qualification",
                    "Negotiation",
                    "Ready to close",
                  ],
                },
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]),

    leadModel.aggregate([
      { $match: leadMatchFilter },
      { $group: { _id: "$source" } },
      { $count: "count" },
    ]),

    leadModel.aggregate([
      {
        $match: {
          ...leadMatchFilter,
          createdAt: { $gte: previousStart, $lt: previousEnd },
        },
      },
      {
        $facet: {
          total: [{ $count: "count" }],
          converted: [{ $match: { status: "Converted" } }, { $count: "count" }],
        },
      },
    ]),

    dealModel.aggregate([
      {
        $match: {
          ...dealMatchFilter,
          status: "Won",
          updatedAt: { $gte: previousStart, $lt: previousEnd },
        },
      },
      { $group: { _id: null, total: { $sum: "$value" } } },
    ]),

    leadModel.aggregate([
      {
        $match: {
          ...leadMatchFilter,
          createdAt: { $gte: previousStart, $lt: previousEnd },
        },
      },
      { $group: { _id: "$source" } },
      { $count: "count" },
    ]),

    organizationModel.countDocuments(dealMatchFilter),
  ]);

  const totalLeads = leadSummary[0]?.total[0]?.count ?? 0;
  const convertedLeads = leadSummary[0]?.converted[0]?.count ?? 0;
  const currentPeriodLeads = leadSummary[0]?.currentPeriod[0]?.count ?? 0;

  const revenue = dealSummary[0]?.wonRevenue[0]?.total ?? 0;
  const currentPeriodRevenue = dealSummary[0]?.currentPeriodWon[0]?.total ?? 0;
  const totalDeals = dealSummary[0]?.totalDeals[0]?.count ?? 0;
  const openDeals = dealSummary[0]?.openDeals[0]?.count ?? 0;

  const activeCampaigns = sourceSummary[0]?.count ?? 0;

  const previousPeriodLeads = previousLeadSummary[0]?.total[0]?.count ?? 0;
  const previousConvertedLeads =
    previousLeadSummary[0]?.converted[0]?.count ?? 0;
  const previousRevenue = previousDealSummary[0]?.total ?? 0;
  const previousCampaigns = previousLeadSourceSummary[0]?.count ?? 0;

  const conversionRate =
    totalLeads > 0
      ? parseFloat(((convertedLeads / totalLeads) * 100).toFixed(1))
      : 0;

  const previousConversionRate =
    previousPeriodLeads > 0
      ? (previousConvertedLeads / previousPeriodLeads) * 100
      : 0;

  const response = {
    stats: {
      totalLeads,
      convertedLeads,
      conversionRate,
      activeCampaigns,
      revenue,
      totalDeals,
      openDeals,
      totalOrganizations: orgCount,
    },
    changes: {
      leadsChange: pctChange(currentPeriodLeads, previousPeriodLeads),
      conversionRateChange: pctChange(conversionRate, previousConversionRate),
      revenueChange: pctChange(currentPeriodRevenue, previousRevenue),
      campaignsChange: pctChange(activeCampaigns, previousCampaigns),
    },
    period: {
      days: 30,
      currentStart,
      currentEnd,
      previousStart,
      previousEnd,
    },
  };

  // Cache the response for 5 minutes (300 seconds)
  await dashboardCache.set(cacheKey, JSON.stringify(response), 300);

  res.json(response);
});
