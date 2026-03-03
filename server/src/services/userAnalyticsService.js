import mongoose from "mongoose";
import UserAnalyticsDashboard from "../models/userAnalyticsDashboardModel.js";
import leadModel from "../models/leadModel.js";
import dealModel from "../models/dealModel.js";
import organizationModel from "../models/organizationModel.js";

const ENTITY_MODEL_MAP = {
  leads: leadModel,
  deals: dealModel,
  organizations: organizationModel,
};

const ALLOWED_GROUP_BY = {
  leads: ["status", "source", "createdAt"],
  deals: ["dealStatus", "createdAt"],
  organizations: ["organizationIndustry", "createdAt"],
};

const ALLOWED_METRIC_FIELDS = {
  leads: { sum: "score", avg: "score" },
  deals: { sum: "dealValue", avg: "dealValue" },
  organizations: { sum: "organizationSize", avg: "organizationSize" },
};

export const getUserDashboard = async (userId, tenantId) => {
  const filter = { userId };
  if (tenantId) filter.tenantId = tenantId;

  let dashboard = await UserAnalyticsDashboard.findOne(filter).lean();

  if (!dashboard) {
    dashboard = await UserAnalyticsDashboard.create({
      userId,
      tenantId: tenantId || undefined,
      layout: [],
    });
    dashboard = dashboard.toObject();
  }

  return dashboard;
};

export const updateDashboardLayout = async (userId, tenantId, layout) => {
  const filter = { userId };
  if (tenantId) filter.tenantId = tenantId;

  const updated = await UserAnalyticsDashboard.findOneAndUpdate(
    filter,
    { $set: { layout } },
    { new: true, upsert: true },
  ).lean();

  return updated;
};

export const computeChartData = async (widgetConfig, tenantId) => {
  const { entity, groupBy, metric, filters = {} } = widgetConfig;

  const Model = ENTITY_MODEL_MAP[entity];
  if (!Model) return [];

  const allowedGroupByFields = ALLOWED_GROUP_BY[entity] || [];
  if (!allowedGroupByFields.includes(groupBy)) return [];

  const matchStage = {};
  if (tenantId) {
    matchStage.tenantId = new mongoose.Types.ObjectId(String(tenantId));
  }

  const SAFE_FILTER_KEYS = {
    leads: ["status", "source"],
    deals: ["dealStatus"],
    organizations: ["organizationIndustry"],
  };

  const safeKeys = SAFE_FILTER_KEYS[entity] || [];
  for (const key of safeKeys) {
    if (filters[key] !== undefined && filters[key] !== null) {
      matchStage[key] = String(filters[key]);
    }
  }

  let groupId;
  if (groupBy === "createdAt") {
    groupId = {
      year: { $year: "$createdAt" },
      month: { $month: "$createdAt" },
    };
  } else {
    groupId = `$${groupBy}`;
  }

  let accumulator;
  if (metric === "count") {
    accumulator = { $sum: 1 };
  } else if (metric === "sum") {
    const field = ALLOWED_METRIC_FIELDS[entity]?.sum;
    accumulator = field ? { $sum: `$${field}` } : { $sum: 1 };
  } else if (metric === "avg") {
    const field = ALLOWED_METRIC_FIELDS[entity]?.avg;
    accumulator = field ? { $avg: `$${field}` } : { $sum: 1 };
  } else {
    accumulator = { $sum: 1 };
  }

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: groupId,
        value: accumulator,
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, _id: 1 } },
    { $limit: 50 },
  ];

  const results = await Model.aggregate(pipeline);

  return results.map((r) => {
    let label;
    if (groupBy === "createdAt" && r._id?.year) {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      label = `${monthNames[(r._id.month || 1) - 1]} ${r._id.year}`;
    } else {
      label = r._id ?? "Unknown";
    }
    return {
      label: String(label),
      value:
        metric === "avg"
          ? parseFloat((r.value ?? 0).toFixed(2))
          : (r.value ?? 0),
    };
  });
};
