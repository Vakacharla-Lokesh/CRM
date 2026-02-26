import mongoose from "mongoose";
import UserAnalyticsDashboard from "../models/UserAnalyticsDashboard.js";
import leadModel from "../models/leadModel.js";
import dealModel from "../models/dealModel.js";
import organizationModel from "../models/organizationModel.js";

// Map entity name to the mongoose model
const ENTITY_MODEL_MAP = {
  leads: leadModel,
  deals: dealModel,
  organizations: organizationModel,
};

// Fields allowed as groupBy keys per entity (allowlist to prevent field injection)
const ALLOWED_GROUP_BY = {
  leads: ["leadStatus", "leadSource", "createdAt"],
  deals: ["dealStatus", "createdAt"],
  organizations: ["organizationIndustry", "createdAt"],
};

// Fields allowed for sum/avg metrics per entity
const ALLOWED_METRIC_FIELDS = {
  leads: { sum: "leadScore", avg: "leadScore" },
  deals: { sum: "dealValue", avg: "dealValue" },
  organizations: { sum: "organizationSize", avg: "organizationSize" },
};

/**
 * Fetch (or create) the user's analytics dashboard.
 *
 * @param {string} userId
 * @param {string|null} tenantId
 * @returns {Promise<Object>}
 */
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

/**
 * Replace the layout array for the user's dashboard.
 *
 * @param {string} userId
 * @param {string|null} tenantId
 * @param {Array} layout
 * @returns {Promise<Object>}
 */
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

/**
 * Build an aggregation pipeline and compute chart data for a single widget.
 *
 * @param {Object} widgetConfig - The widget document from the layout array.
 * @param {string|null} tenantId - Tenant id for isolation.
 * @returns {Promise<Array>}
 */
export const computeChartData = async (widgetConfig, tenantId) => {
  const { entity, groupBy, metric, filters = {} } = widgetConfig;

  const Model = ENTITY_MODEL_MAP[entity];
  if (!Model) return [];

  const allowedGroupByFields = ALLOWED_GROUP_BY[entity] || [];
  if (!allowedGroupByFields.includes(groupBy)) return [];

  // Build base $match stage — always enforce tenant isolation
  const matchStage = {};
  if (tenantId) {
    matchStage.tenantId = new mongoose.Types.ObjectId(String(tenantId));
  }

  // Apply safe filters (allowlist: status-like string filters only)
  const SAFE_FILTER_KEYS = {
    leads: ["leadStatus", "leadSource"],
    deals: ["dealStatus"],
    organizations: ["organizationIndustry"],
  };

  const safeKeys = SAFE_FILTER_KEYS[entity] || [];
  for (const key of safeKeys) {
    if (filters[key] !== undefined && filters[key] !== null) {
      matchStage[key] = String(filters[key]);
    }
  }

  // Determine $group _id
  let groupId;
  if (groupBy === "createdAt") {
    groupId = {
      year: { $year: "$createdAt" },
      month: { $month: "$createdAt" },
    };
  } else {
    groupId = `$${groupBy}`;
  }

  // Determine accumulator
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

  // Normalize output for frontend
  return results.map((r) => {
    let label;
    if (groupBy === "createdAt" && r._id?.year) {
      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];
      label = `${monthNames[(r._id.month || 1) - 1]} ${r._id.year}`;
    } else {
      label = r._id ?? "Unknown";
    }
    return {
      label: String(label),
      value: metric === "avg" ? parseFloat((r.value ?? 0).toFixed(2)) : (r.value ?? 0),
    };
  });
};
