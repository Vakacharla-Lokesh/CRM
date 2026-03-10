import asyncCatch from "../../utils/asyncCatch.js";
import * as analyticsService from "../../services/analyticsService.js";
import mongoose from "mongoose";

export const getLeadTrends = asyncCatch(async (req, res) => {
  const permissions = req.auth?.permissions ?? [];
  const permissionsArray = Array.isArray(permissions)
    ? permissions
    : Object.keys(permissions).filter((k) => permissions[k] === true);

  const canViewAll =
    req.auth?.role === "super_admin" ||
    req.auth?.role === "admin" ||
    permissionsArray.includes("analytics:view_all");

  const tenantBase = req.tenantFilter || {};
  const filter = canViewAll
    ? { ...tenantBase }
    : {
        ...tenantBase,
        $or: [
          { assignedTo: new mongoose.Types.ObjectId(req.auth.userId) },
          { createdBy: new mongoose.Types.ObjectId(req.auth.userId) },
        ],
      };
  const days = Math.min(parseInt(req.query.days ?? "30"), 90);

  const trends = await analyticsService.getLeadTrends(filter, days);

  res.json({ trends, days });
});

export const getLeadStatusBreakdown = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    req.auth?.role === "admin" ||
    (Array.isArray(req.auth?.permissions) &&
      req.auth.permissions.includes("leads:view_all"));
  const tenantBase = req.tenantFilter || {};
  const filter = canViewAll
    ? { ...tenantBase }
    : {
        ...tenantBase,
        $or: [
          { assignedTo: new mongoose.Types.ObjectId(req.auth.userId) },
          { createdBy: new mongoose.Types.ObjectId(req.auth.userId) },
        ],
      };
  const days = req.query.days !== undefined ? parseInt(req.query.days) : null;

  const { breakdown, total } = await analyticsService.getLeadStatusBreakdown(
    filter,
    days,
  );

  res.json({ breakdown, total, days });
});

export const getLeadScoreDistribution = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    req.auth?.role === "admin" ||
    (Array.isArray(req.auth?.permissions) &&
      req.auth.permissions.includes("leads:view_all"));
  const tenantBase = req.tenantFilter || {};
  const filter = canViewAll
    ? { ...tenantBase }
    : {
        ...tenantBase,
        $or: [
          { assignedTo: new mongoose.Types.ObjectId(req.auth.userId) },
          { createdBy: new mongoose.Types.ObjectId(req.auth.userId) },
        ],
      };

  const distribution = await analyticsService.getLeadScoreDistribution(filter);

  res.json({ distribution });
});
