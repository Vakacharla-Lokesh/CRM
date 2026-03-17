import { startOfDay } from "date-fns";
import leadModel from "../../leads/models/leadModel.js";
import dealModel from "../../deals/models/dealModel.js";
import organizationModel from "../../organizations/models/organizationModel.js";
import AnalyticsSnapshot from "../models/analyticsSnapshotModel.js";
import tenantModel from "../../tenants/models/tenantModel.js";
import userModel from "../../users/models/userModel.js";
import { periodDates, pctChange } from "../../../utils/dateFormat.js";
import { logger } from "../../../utils/logger.js";
import { wrapServiceFn } from "../../../utils/serviceWrapper.js";

const PERIOD_KEY = "historical";
export const TENANT_SCOPE_KEY = "tenant";

export const computeSnapshotForScope = wrapServiceFn(
  async function computeSnapshotForScope(leadFilter, dealFilter) {
    const { currentStart, currentEnd, previousStart, previousEnd } =
      periodDates(30);

    const todayStart = startOfDay(new Date());

    const historicalLeadFilter = {
      ...leadFilter,
      createdAt: { $lt: todayStart },
    };
    const historicalDealFilter = { ...dealFilter };

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
          { $match: historicalLeadFilter },
          {
            $facet: {
              total: [{ $count: "count" }],
              converted: [
                { $match: { status: "Converted" } },
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
        ],
        { readPreference: "secondaryPreferred" },
      ),

      dealModel.aggregate(
        [
          { $match: historicalDealFilter },
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
          { $match: historicalLeadFilter },
          { $group: { _id: "$source" } },
          { $count: "count" },
        ],
        { readPreference: "secondaryPreferred" },
      ),

      leadModel.aggregate(
        [
          {
            $match: {
              ...historicalLeadFilter,
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
              ...historicalDealFilter,
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
              ...historicalLeadFilter,
              createdAt: { $gte: previousStart, $lt: previousEnd },
            },
          },
          { $group: { _id: "$source" } },
          { $count: "count" },
        ],
        { readPreference: "secondaryPreferred" },
      ),

      organizationModel.aggregate(
        [{ $match: historicalDealFilter }, { $count: "count" }],
        { readPreference: "secondaryPreferred" },
      ),
    ]);

    const totalLeads = leadSummary[0]?.total[0]?.count ?? 0;
    const convertedLeads = leadSummary[0]?.converted[0]?.count ?? 0;
    const currentPeriodLeads = leadSummary[0]?.currentPeriod[0]?.count ?? 0;

    const revenue = dealSummary[0]?.wonRevenue[0]?.total ?? 0;
    const currentPeriodRevenue =
      dealSummary[0]?.currentPeriodWon[0]?.total ?? 0;
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
  },
);

export const saveAnalyticsSnapshot = wrapServiceFn(
  async function saveAnalyticsSnapshot(
    tenantId,
    scopeKey,
    leadFilter,
    dealFilter,
  ) {
    logger.info(
      `[AnalyticsSnapshot] Computing snapshot — tenant: ${tenantId}, scope: ${scopeKey}`,
    );

    const computed = await computeSnapshotForScope(leadFilter, dealFilter);

    await AnalyticsSnapshot.findOneAndUpdate(
      { tenantId, scopeKey, periodKey: PERIOD_KEY },
      {
        tenantId,
        scopeKey,
        periodKey: PERIOD_KEY,
        stats: computed.stats,
        changes: computed.changes,
        period: computed.period,
        computedAt: new Date(),
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      { upsert: true, new: true },
    );

    logger.info(
      `[AnalyticsSnapshot] Snapshot saved — tenant: ${tenantId}, scope: ${scopeKey}`,
    );
  },
);

export const computeTodayDelta = wrapServiceFn(
  async function computeTodayDelta(leadFilter, dealFilter) {
    const todayStart = startOfDay(new Date());

    const todayLeadFilter = { ...leadFilter, createdAt: { $gte: todayStart } };
    const todayDealFilter = { ...dealFilter };

    const [leadToday, dealToday, sourcesToday, orgsToday] = await Promise.all([
      leadModel.aggregate(
        [
          { $match: todayLeadFilter },
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
          { $match: todayDealFilter },
          {
            $facet: {
              wonRevenue: [
                { $match: { status: "Won", updatedAt: { $gte: todayStart } } },
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
                    createdAt: { $gte: todayStart },
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
          { $match: todayLeadFilter },
          { $group: { _id: "$source" } },
          { $count: "count" },
        ],
        { readPreference: "secondaryPreferred" },
      ),

      organizationModel.aggregate(
        [
          { $match: { ...dealFilter, createdAt: { $gte: todayStart } } },
          { $count: "count" },
        ],
        { readPreference: "secondaryPreferred" },
      ),
    ]);

    return {
      totalLeads: leadToday[0]?.total[0]?.count ?? 0,
      convertedLeads: leadToday[0]?.converted[0]?.count ?? 0,
      revenue: dealToday[0]?.wonRevenue[0]?.total ?? 0,
      totalDeals: dealToday[0]?.totalDeals[0]?.count ?? 0,
      openDeals: dealToday[0]?.openDeals[0]?.count ?? 0,
      activeCampaigns: sourcesToday[0]?.count ?? 0,
      totalOrganizations: orgsToday[0]?.count ?? 0,
    };
  },
);

export const getAllTenantsWithUsers = wrapServiceFn(
  async function getAllTenantsWithUsers() {
    const tenants = await tenantModel
      .find({ isActive: true }, { _id: 1 })
      .lean();

    const result = await Promise.all(
      tenants.map(async (tenant) => {
        const users = await userModel
          .find({ tenantId: tenant._id, isActive: true }, { _id: 1 })
          .lean();

        return {
          tenantId: tenant._id,
          userIds: users.map((u) => u._id),
        };
      }),
    );

    return result;
  },
);
