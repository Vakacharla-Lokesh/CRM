import asyncCatch from "../../../utils/asyncCatch.js";
import AppError from "../../../utils/appError.js";
import {
  getUsersStatsService,
  getTenantsStatsService,
} from "../services/statsService.js";

export const getUsersStatsController = asyncCatch(async (req, res) => {
  const filter = req.tenantFilter || {};
  const stats = await getUsersStatsService(filter);

  res.json(stats);
});

export const getTenantsStatsController = asyncCatch(async (req, res) => {
  const stats = await getTenantsStatsService();

  res.json(stats);
});
