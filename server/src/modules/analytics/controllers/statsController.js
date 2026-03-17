import asyncCatch from "../../../utils/asyncCatch.js";
import AppError from "../../../utils/appError.js";
import {
  getUsersStatsService,
  getTenantsStatsService,
} from "../services/statsService.js";

export const getUsersStatsController = asyncCatch(async (req, res) => {
  const filter = req.tenantFilter || {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status === "active") filter.isActive = true;
  else if (req.query.status === "inactive") filter.isActive = false;
  const stats = await getUsersStatsService(filter);

  res.json(stats);
});

export const getTenantsStatsController = asyncCatch(async (req, res) => {
  const stats = await getTenantsStatsService();

  res.json(stats);
});
