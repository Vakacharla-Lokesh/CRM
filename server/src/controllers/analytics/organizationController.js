import asyncCatch from "../../utils/asyncCatch.js";
import * as analyticsService from "../../services/analyticsService.js";

export const getOrganizationStats = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    req.auth?.role === "admin" ||
    (Array.isArray(req.auth?.permissions) && req.auth.permissions.includes("organizations:view_all"));
  const filter = req.tenantFilter || {};
  if (!canViewAll) {
    filter.userId = req.auth.userId;
  }

  const stats = await analyticsService.getOrganizationStats(filter);

  res.json({ stats });
});

export const getTopOrganizations = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    req.auth?.role === "admin" ||
    (Array.isArray(req.auth?.permissions) && req.auth.permissions.includes("organizations:view_all"));
  const filter = req.tenantFilter || {};
  if (!canViewAll) {
    filter.userId = req.auth.userId;
  }
  const limit = Math.min(parseInt(req.query.limit ?? "10"), 25);

  const organizations = await analyticsService.getTopOrganizations(
    filter,
    limit,
  );

  res.json({ organizations });
});
