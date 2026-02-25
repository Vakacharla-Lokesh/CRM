import leadModel from "../models/leadModel.js";
import dealModel from "../models/dealModel.js";
import organizationModel from "../models/organizationModel.js";
import { periodDates, pctChange } from "../utils/dateFormat.js";
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

export const getDashboardStats = async (req, res, next) => {
  try {
    const filter = req.tenantFilter || {};
    const { currentStart, currentEnd, previousStart, previousEnd } =
      periodDates(30);

    const matchFilter = { ...filter };

    const [
      leadSummary,
      dealSummary,
      leadSourceSummary,
      previousLeadSummary,
      previousDealSummary,
      previousLeadSourceSummary,
      orgCount,
    ] = await Promise.all([
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

      leadModel.aggregate([
        { $match: matchFilter },
        { $group: { _id: "$leadSource" } },
        { $count: "count" },
      ]),

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

      organizationModel.countDocuments(matchFilter),
    ]);

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
