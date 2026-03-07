import leadModel from "../models/leadModel.js";
import dealModel from "../models/dealModel.js";
import organizationModel from "../models/organizationModel.js";
import { periodDates, pctChange } from "../utils/dateFormat.js";
import { dashboardCache } from "../config/cache.js";

export const getDashboardStats = async (userId, leadFilter, dealFilter) => {
  const cacheKey = `dashboard_stats_${userId}`;

  const cachedData = await dashboardCache.get(cacheKey);
  if (cachedData) return cachedData;

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
    leadModel.aggregate(
      [
        { $match: leadMatchFilter },
        {
          $facet: {
            total: [{ $count: "count" }],
            converted: [
              { $match: { status: "Converted" } },
              { $count: "count" },
            ],
            currentPeriod: [
              {
                $match: { createdAt: { $gte: currentStart, $lte: currentEnd } },
              },
              { $count: "count" },
            ],
          },
        },
      ],
      { readPreference: "secondaryPreferred" },
    ),

    dealModel.aggregate(
      [
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
      ],
      { readPreference: "secondaryPreferred" },
    ),

    leadModel.aggregate(
      [
        { $match: leadMatchFilter },
        { $group: { _id: "$source" } },
        { $count: "count" },
      ],
      { readPreference: "secondaryPreferred" },
    ),

    leadModel.aggregate(
      [
        {
          $match: {
            ...leadMatchFilter,
            createdAt: { $gte: previousStart, $lt: previousEnd },
          },
        },
        {
          $facet: {
            total: [{ $count: "count" }],
            converted: [
              { $match: { status: "Converted" } },
              { $count: "count" },
            ],
          },
        },
      ],
      { readPreference: "secondaryPreferred" },
    ),

    dealModel.aggregate(
      [
        {
          $match: {
            ...dealMatchFilter,
            status: "Won",
            updatedAt: { $gte: previousStart, $lt: previousEnd },
          },
        },
        { $group: { _id: null, total: { $sum: "$value" } } },
      ],
      { readPreference: "secondaryPreferred" },
    ),

    leadModel.aggregate(
      [
        {
          $match: {
            ...leadMatchFilter,
            createdAt: { $gte: previousStart, $lt: previousEnd },
          },
        },
        { $group: { _id: "$source" } },
        { $count: "count" },
      ],
      { readPreference: "secondaryPreferred" },
    ),

    organizationModel.aggregate(
      [{ $match: dealMatchFilter }, { $count: "count" }],
      { readPreference: "secondaryPreferred" },
    ),
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

  await dashboardCache.set(cacheKey, JSON.stringify(response), 300);

  return response;
};

// Lead analytics
export {
  getLeadTrends,
  getLeadStatusBreakdown,
  getLeadScoreDistribution,
} from "./analytics/leadAnalyticsService.js";

// Deal analytics
export {
  getDealPipeline,
  getDealTrends,
} from "./analytics/dealAnalyticsService.js";

// Organization analytics

export {
  getOrganizationStats,
  getTopOrganizations,
} from "./analytics/organizationAnalyticsService.js";
