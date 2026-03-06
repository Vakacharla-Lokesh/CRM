import asyncCatch from "../../utils/asyncCatch.js";
import * as analyticsService from "../../services/analyticsService.js";

export const getDealPipeline = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    req.auth?.role === "admin" ||
    (Array.isArray(req.auth?.permissions) && req.auth.permissions.includes("deals:view_all"));
  const filter = req.tenantFilter || {};
  if (!canViewAll) {
    filter.userId = req.auth.userId;
  }

  const result = await analyticsService.getDealPipeline(filter);

  res.json(result);
});

export const getDealTrends = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    req.auth?.role === "admin" ||
    (Array.isArray(req.auth?.permissions) && req.auth.permissions.includes("deals:view_all"));
  const filter = req.tenantFilter || {};
  if (!canViewAll) {
    filter.userId = req.auth.userId;
  }
  const days = Math.min(parseInt(req.query.days ?? "30"), 90);

  const trends = await analyticsService.getDealTrends(filter, days);

  res.json({ trends, days });
});
