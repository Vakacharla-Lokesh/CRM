import mongoose from "mongoose";
import leadModel from "../models/leadModel.js";
import dealModel from "../models/dealModel.js";
import organizationModel from "../models/organizationModel.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

const periodDates = (days = 30) => {
  const now = new Date();

  const currentEnd = new Date(now);
  const currentStart = new Date(now);
  currentStart.setDate(currentStart.getDate() - days);

  const previousEnd = new Date(currentStart);
  const previousStart = new Date(currentStart);
  previousStart.setDate(previousStart.getDate() - days);

  return { currentStart, currentEnd, previousStart, previousEnd };
};

const pctChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return parseFloat((((current - previous) / previous) * 100).toFixed(1));
};

// ─── GET /analytics/dashboard ────────────────────────────────────────────────
// Single-pass aggregations run in parallel via Promise.all

export const getDashboardStats = async (req, res, next) => {
  try {
    const filter = req.tenantFilter || {};
    const { currentStart, currentEnd, previousStart, previousEnd } =
      periodDates(30);

    // Convert filter _id strings to ObjectId if needed
    const matchFilter = { ...filter };

    // Run all aggregations in parallel
    const [
      leadSummary,
      dealSummary,
      leadSourceSummary,
      previousLeadSummary,
      previousDealSummary,
      previousLeadSourceSummary,
      orgCount,
    ] = await Promise.all([
      // 1. Current period lead summary — total, converted, new
      leadModel.aggregate([
        { $match: matchFilter },
        {
          $facet: {
            total: [{ $count: "count" }],
            converted: [
              { $match: { leadStatus: "Converted" } },
              { $count: "count" },
            ],
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

      // 2. Current period deal summary — won deals & total pipeline value
      dealModel.aggregate([
        { $match: matchFilter },
        {
          $facet: {
            wonRevenue: [
              { $match: { dealStatus: "Won" } },
              { $group: { _id: null, total: { $sum: "$dealValue" } } },
            ],
            currentPeriodWon: [
              {
                $match: {
                  dealStatus: "Won",
                  updatedAt: { $gte: currentStart, $lte: currentEnd },
                },
              },
              { $group: { _id: null, total: { $sum: "$dealValue" } } },
            ],
            totalDeals: [{ $count: "count" }],
            openDeals: [
              {
                $match: {
                  dealStatus: {
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

      // 3. Current period unique lead sources (proxy for active campaigns)
      leadModel.aggregate([
        { $match: matchFilter },
        { $group: { _id: "$leadSource" } },
        { $count: "count" },
      ]),

      // 4. Previous period lead summary
      leadModel.aggregate([
        {
          $match: {
            ...matchFilter,
            createdAt: { $gte: previousStart, $lt: previousEnd },
          },
        },
        {
          $facet: {
            total: [{ $count: "count" }],
            converted: [
              { $match: { leadStatus: "Converted" } },
              { $count: "count" },
            ],
          },
        },
      ]),

      // 5. Previous period deal revenue
      dealModel.aggregate([
        {
          $match: {
            ...matchFilter,
            dealStatus: "Won",
            updatedAt: { $gte: previousStart, $lt: previousEnd },
          },
        },
        { $group: { _id: null, total: { $sum: "$dealValue" } } },
      ]),

      // 6. Previous period unique lead sources
      leadModel.aggregate([
        {
          $match: {
            ...matchFilter,
            createdAt: { $gte: previousStart, $lt: previousEnd },
          },
        },
        { $group: { _id: "$leadSource" } },
        { $count: "count" },
      ]),

      // 7. Total organizations
      organizationModel.countDocuments(matchFilter),
    ]);

    // ── Extract values ───────────────────────────────────────────────────────

    const totalLeads = leadSummary[0]?.total[0]?.count ?? 0;
    const convertedLeads = leadSummary[0]?.converted[0]?.count ?? 0;
    const currentPeriodLeads = leadSummary[0]?.currentPeriod[0]?.count ?? 0;

    const revenue = dealSummary[0]?.wonRevenue[0]?.total ?? 0;
    const currentPeriodRevenue =
      dealSummary[0]?.currentPeriodWon[0]?.total ?? 0;
    const totalDeals = dealSummary[0]?.totalDeals[0]?.count ?? 0;
    const openDeals = dealSummary[0]?.openDeals[0]?.count ?? 0;

    const activeCampaigns = leadSourceSummary[0]?.count ?? 0;

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

    res.json({
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
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /analytics/leads/trends ─────────────────────────────────────────────

export const getLeadTrends = async (req, res, next) => {
  try {
    const filter = req.tenantFilter || {};
    const days = Math.min(parseInt(req.query.days ?? "30"), 90);

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
            status: "$leadStatus",
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

    res.json({ trends, days });
  } catch (err) {
    next(err);
  }
};

// ─── GET /analytics/leads/status-breakdown ───────────────────────────────────

export const getLeadStatusBreakdown = async (req, res, next) => {
  try {
    const filter = req.tenantFilter || {};
    const days = req.query.days !== undefined ? parseInt(req.query.days) : null;

    const matchFilter =
      days !== null
        ? { ...filter, createdAt: { $gte: new Date(Date.now() - days * 864e5) } }
        : { ...filter };

    const breakdown = await leadModel.aggregate([
      {
        $match: matchFilter,
      },
      {
        $group: {
          _id: "$leadStatus",
          count: { $sum: 1 },
          avgScore: { $avg: "$leadScore" },
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

    res.json({ breakdown: enriched, total, days });
  } catch (err) {
    next(err);
  }
};

// ─── GET /analytics/leads/score-distribution ─────────────────────────────────

export const getLeadScoreDistribution = async (req, res, next) => {
  try {
    const filter = req.tenantFilter || {};

    const distribution = await leadModel.aggregate([
      { $match: filter },
      {
        $bucket: {
          groupBy: "$leadScore",
          boundaries: [0, 20, 40, 60, 80, 101],
          default: "Unknown",
          output: {
            count: { $sum: 1 },
            leads: { $push: { status: "$leadStatus" } },
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

    res.json({ distribution });
  } catch (err) {
    next(err);
  }
};

// ─── GET /analytics/deals/pipeline ───────────────────────────────────────────

export const getDealPipeline = async (req, res, next) => {
  try {
    const filter = req.tenantFilter || {};

    const [pipeline, trends] = await Promise.all([
      // Stage breakdown with value and count
      dealModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$dealStatus",
            count: { $sum: 1 },
            totalValue: { $sum: "$dealValue" },
            avgValue: { $avg: "$dealValue" },
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

      // Monthly deal creation trend (last 6 months)
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
            totalValue: { $sum: "$dealValue" },
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

    res.json({
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
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /analytics/deals/trends ─────────────────────────────────────────────

export const getDealTrends = async (req, res, next) => {
  try {
    const filter = req.tenantFilter || {};
    const days = Math.min(parseInt(req.query.days ?? "30"), 90);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await dealModel.aggregate([
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
            status: "$dealStatus",
          },
          count: { $sum: 1 },
          value: { $sum: "$dealValue" },
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

    res.json({ trends, days });
  } catch (err) {
    next(err);
  }
};

// ─── GET /analytics/organizations/stats ──────────────────────────────────────

export const getOrganizationStats = async (req, res, next) => {
  try {
    const filter = req.tenantFilter || {};

    const stats = await organizationModel.aggregate([
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
          _id: "$organizationIndustry",
          organizationCount: { $sum: 1 },
          totalSize: { $sum: "$organizationSize" },
          avgSize: { $avg: "$organizationSize" },
          totalLeads: { $sum: { $size: "$leads" } },
          convertedLeads: {
            $sum: {
              $size: {
                $filter: {
                  input: "$leads",
                  as: "lead",
                  cond: { $eq: ["$$lead.leadStatus", "Converted"] },
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

    res.json({ stats });
  } catch (err) {
    next(err);
  }
};

// ─── GET /analytics/organizations/top ────────────────────────────────────────

export const getTopOrganizations = async (req, res, next) => {
  try {
    const filter = req.tenantFilter || {};
    const limit = Math.min(parseInt(req.query.limit ?? "10"), 25);

    const top = await organizationModel.aggregate([
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
          organizationName: 1,
          organizationIndustry: 1,
          organizationSize: 1,
          totalLeads: { $size: "$leads" },
          convertedLeads: {
            $size: {
              $filter: {
                input: "$leads",
                as: "l",
                cond: { $eq: ["$$l.leadStatus", "Converted"] },
              },
            },
          },
          totalDeals: { $size: "$deals" },
          totalDealValue: { $sum: "$deals.dealValue" },
          wonDealValue: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$deals",
                    as: "d",
                    cond: { $eq: ["$$d.dealStatus", "Won"] },
                  },
                },
                as: "wd",
                in: "$$wd.dealValue",
              },
            },
          },
        },
      },
      { $sort: { totalDealValue: -1 } },
      { $limit: limit },
    ]);

    res.json({ organizations: top });
  } catch (err) {
    next(err);
  }
};
