import leadModel from "../../leads/models/leadModel.js";
import dealModel from "../../deals/models/dealModel.js";
import organizationModel from "../../organizations/models/organizationModel.js";
import AnalyticsSnapshot from "../models/analyticsSnapshotModel.js";
import { periodDates, pctChange } from "../../../utils/dateFormat.js";
import { dashboardCache } from "../../../config/cache.js";
import {
  computeTodayDelta,
  TENANT_SCOPE_KEY,
} from "./analyticsSnapshotService.js";
import { logger } from "../../../utils/logger.js";

const PERIOD_KEY = "historical";

export const getDashboardStats = async (userId, leadFilter, dealFilter) => {
  const cacheKey = `dashboard_stats_${userId}`;

  const cachedData = await dashboardCache.get(cacheKey);
  if (cachedData) return cachedData;

  const { currentStart, currentEnd, previousStart, previousEnd } =
    periodDates(30);

  const tenantId = leadFilter?.tenantId ?? null;

  const scopeKey = leadFilter?.assignedTo
    ? leadFilter.assignedTo.toString()
    : TENANT_SCOPE_KEY;

  let response;

  const snapshot = tenantId
    ? await AnalyticsSnapshot.findOne({
        tenantId,
        scopeKey,
        periodKey: PERIOD_KEY,
      }).lean()
    : null;

  if (snapshot) {
    logger.info(
      `[Analytics] Serving from snapshot — tenant: ${tenantId}, scope: ${scopeKey}`,
    );

    const delta = await computeTodayDelta(leadFilter, dealFilter);

    const mergedStats = mergeSnapshotWithDelta(snapshot.stats, delta);

    response = {
      stats: mergedStats,
      changes: snapshot.changes,
      period: {
        days: 30,
        currentStart: snapshot.period.currentStart,
        currentEnd: snapshot.period.currentEnd,
        previousStart: snapshot.period.previousStart,
        previousEnd: snapshot.period.previousEnd,
      },
      _source: "snapshot",
    };
  } else {
    logger.info(
      `[Analytics] No snapshot found, running full computation — scope: ${scopeKey}`,
    );

    response = await fullComputation(leadFilter, dealFilter, {
      currentStart,
      currentEnd,
      previousStart,
      previousEnd,
    });

    response._source = "live";
  }

  await dashboardCache.set(cacheKey, JSON.stringify(response), 300);

  return response;
};

function mergeSnapshotWithDelta(snapshotStats, delta) {
  const totalLeads = snapshotStats.totalLeads + delta.totalLeads;
  const convertedLeads = snapshotStats.convertedLeads + delta.convertedLeads;

  const conversionRate =
    totalLeads > 0
      ? parseFloat(((convertedLeads / totalLeads) * 100).toFixed(1))
      : 0;

  return {
    totalLeads,
    convertedLeads,
    conversionRate,
    activeCampaigns: snapshotStats.activeCampaigns + delta.activeCampaigns,
    revenue: snapshotStats.revenue + delta.revenue,
    totalDeals: snapshotStats.totalDeals + delta.totalDeals,
    openDeals: snapshotStats.openDeals + delta.openDeals,
    totalOrganizations:
      snapshotStats.totalOrganizations + delta.totalOrganizations,
  };
}

async function fullComputation(
  leadFilter,
  dealFilter,
  { currentStart, currentEnd, previousStart, previousEnd },
) {
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

  return {
    stats: {
      totalLeads,
      convertedLeads,
      conversionRate,
      activeCampaigns,
      revenue,
      totalDeals,
      openDeals,
      totalOrganizations: orgCount[0]?.count ?? 0,
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
}

// Lead analytics
export {
  getLeadTrends,
  getLeadStatusBreakdown,
  getLeadScoreDistribution,
} from "./leadAnalyticsService.js";

// Deal analytics
export {
  getDealPipeline,
  getDealTrends,
} from "./dealAnalyticsService.js";

// Organization analytics
export {
  getOrganizationStats,
  getTopOrganizations,
} from "./organizationAnalyticsService.js";
