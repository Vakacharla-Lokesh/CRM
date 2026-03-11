import asyncCatch from "../../../utils/asyncCatch.js";
import AppError from "../../../utils/appError.js";
import {
  getUsersStatsService,
  getTenantsStatsService,
} from "../services/statsService.js";

/**
 * GET /api/stats/users
 * Super Admin → global stats.
 * Tenant Admin → tenant-scoped stats.
 */
export const getUsersStatsController = asyncCatch(async (req, res) => {
  const filter = req.tenantFilter || {};
  const stats = await getUsersStatsService(filter);

  res.json(stats);
});

/**
 * GET /api/stats/tenants
 * Super Admin only (enforced via requirePermission middleware).
 */
export const getTenantsStatsController = asyncCatch(async (req, res) => {
  const stats = await getTenantsStatsService();

  res.json(stats);
});
