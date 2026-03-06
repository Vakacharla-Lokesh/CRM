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

  await dashboardCache.set(cacheKey, JSON.stringify(response), 300);

  return response;
};

// Lead analytics
export const getLeadTrends = async (filter, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const trends = await leadModel.aggregate([
    {
      $match: {
        ...filter,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          status: "$status",
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: "$_id.date",
        total: { $sum: "$count" },
        byStatus: {
          $push: { status: "$_id.status", count: "$count" },
        },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: "$_id",
        total: 1,
        byStatus: 1,
      },
    },
  ]);

  return trends;
};

export const getLeadStatusBreakdown = async (filter, days) => {
  const matchFilter =
    days !== null
      ? {
          ...filter,
          createdAt: { $gte: new Date(Date.now() - days * 864e5) },
        }
      : { ...filter };

  const breakdown = await leadModel.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        avgScore: { $avg: "$score" },
      },
    },
    {
      $project: {
        _id: 0,
        status: "$_id",
        count: 1,
        avgScore: { $round: ["$avgScore", 1] },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const total = breakdown.reduce((sum, b) => sum + b.count, 0);

  const enriched = breakdown.map((b) => ({
    ...b,
    percentage:
      total > 0 ? parseFloat(((b.count / total) * 100).toFixed(1)) : 0,
  }));

  return { breakdown: enriched, total };
};

export const getLeadScoreDistribution = async (filter) => {
  return leadModel.aggregate([
    { $match: filter },
    {
      $bucket: {
        groupBy: "$score",
        boundaries: [0, 20, 40, 60, 80, 101],
        default: "Unknown",
        output: {
          count: { $sum: 1 },
          leads: { $push: { status: "$status" } },
        },
      },
    },
    {
      $project: {
        _id: 0,
        range: {
          $switch: {
            branches: [
              { case: { $eq: ["$_id", 0] }, then: "0-19" },
              { case: { $eq: ["$_id", 20] }, then: "20-39" },
              { case: { $eq: ["$_id", 40] }, then: "40-59" },
              { case: { $eq: ["$_id", 60] }, then: "60-79" },
              { case: { $eq: ["$_id", 80] }, then: "80-100" },
            ],
            default: "Unknown",
          },
        },
        count: 1,
        convertedCount: {
          $size: {
            $filter: {
              input: "$leads",
              as: "l",
              cond: { $eq: ["$$l.status", "Converted"] },
            },
          },
        },
      },
    },
  ]);
};

// Deal analytics
export const getDealPipeline = async (filter) => {
  const [pipeline, trends] = await Promise.all([
    dealModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$value" },
          avgValue: { $avg: "$value" },
        },
      },
      {
        $project: {
          _id: 0,
          stage: "$_id",
          count: 1,
          totalValue: 1,
          avgValue: { $round: ["$avgValue", 2] },
        },
      },
      { $sort: { totalValue: -1 } },
    ]),

    dealModel.aggregate([
      {
        $match: {
          ...filter,
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          totalValue: { $sum: "$value" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          count: 1,
          totalValue: 1,
        },
      },
    ]),
  ]);

  const totalPipelineValue = pipeline.reduce((s, p) => s + p.totalValue, 0);
  const totalDeals = pipeline.reduce((s, p) => s + p.count, 0);

  const enrichedPipeline = pipeline.map((p) => ({
    ...p,
    percentage:
      totalPipelineValue > 0
        ? parseFloat(((p.totalValue / totalPipelineValue) * 100).toFixed(1))
        : 0,
  }));

  return {
    pipeline: enrichedPipeline,
    trends,
    summary: {
      totalPipelineValue,
      totalDeals,
      avgDealValue:
        totalDeals > 0
          ? parseFloat((totalPipelineValue / totalDeals).toFixed(2))
          : 0,
    },
  };
};

export const getDealTrends = async (filter, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return dealModel.aggregate([
    {
      $match: {
        ...filter,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          status: "$status",
        },
        count: { $sum: 1 },
        value: { $sum: "$value" },
      },
    },
    {
      $group: {
        _id: "$_id.date",
        totalDeals: { $sum: "$count" },
        totalValue: { $sum: "$value" },
        byStatus: {
          $push: {
            status: "$_id.status",
            count: "$count",
            value: "$value",
          },
        },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: "$_id",
        totalDeals: 1,
        totalValue: 1,
        byStatus: 1,
      },
    },
  ]);
};

// Organization analytics
export const getOrganizationStats = async (filter) => {
  return organizationModel.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "leads",
        localField: "_id",
        foreignField: "organizationId",
        as: "leads",
      },
    },
    {
      $group: {
        _id: "$industry",
        organizationCount: { $sum: 1 },
        totalSize: { $sum: "$size" },
        avgSize: { $avg: "$size" },
        totalLeads: { $sum: { $size: "$leads" } },
        convertedLeads: {
          $sum: {
            $size: {
              $filter: {
                input: "$leads",
                as: "lead",
                cond: { $eq: ["$$lead.status", "Converted"] },
              },
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        industry: "$_id",
        organizationCount: 1,
        totalSize: 1,
        avgSize: { $round: ["$avgSize", 0] },
        totalLeads: 1,
        convertedLeads: 1,
        conversionRate: {
          $cond: [
            { $gt: ["$totalLeads", 0] },
            {
              $round: [
                {
                  $multiply: [
                    { $divide: ["$convertedLeads", "$totalLeads"] },
                    100,
                  ],
                },
                1,
              ],
            },
            0,
          ],
        },
      },
    },
    { $sort: { organizationCount: -1 } },
  ]);
};

export const getTopOrganizations = async (filter, limit = 10) => {
  return organizationModel.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "leads",
        localField: "_id",
        foreignField: "organizationId",
        as: "leads",
      },
    },
    {
      $lookup: {
        from: "deals",
        localField: "_id",
        foreignField: "organizationId",
        as: "deals",
      },
    },
    {
      $project: {
        name: 1,
        industry: 1,
        size: 1,
        totalLeads: { $size: "$leads" },
        convertedLeads: {
          $size: {
            $filter: {
              input: "$leads",
              as: "l",
              cond: { $eq: ["$$l.status", "Converted"] },
            },
          },
        },
        totalDeals: { $size: "$deals" },
        totalDealValue: { $sum: "$deals.value" },
        wonDealValue: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: "$deals",
                  as: "d",
                  cond: { $eq: ["$$d.status", "Won"] },
                },
              },
              as: "wd",
              in: "$$wd.value",
            },
          },
        },
      },
    },
    { $sort: { totalDealValue: -1 } },
    { $limit: limit },
  ]);
};
