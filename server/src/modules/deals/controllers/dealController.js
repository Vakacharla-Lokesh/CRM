import * as dealService from "../services/dealService.js";
import asyncCatch from "../../../utils/asyncCatch.js";
import AppError from "../../../utils/appError.js";
import { fireWorkflowTrigger } from "../../../middlewares/workflowTrigger.js";

// Get all deals
export const getAllDeals = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    (Array.isArray(req.auth?.permissions) &&
      req.auth.permissions.includes("deals:view_all"));

  const filter =
    req.tenantContext?.scope === "tenant"
      ? { tenantId: req.tenantContext.tenantId }
      : {};

  if (!canViewAll) {
    filter.userId = req.auth.userId;
  }

  // Server-side filters
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.stage) {
    filter.status = req.query.stage;
  }

  const limit = parseInt(req.query.limit) || 20;
  const cursor = req.query.cursor;

  const { deals, nextCursor, hasNextPage } = await dealService.getAllDeals(
    filter,
    { limit, cursor },
  );

  res.json({ count: deals.length, deals, nextCursor, hasNextPage });
});

// Get deal by ID
export const getDealById = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    (Array.isArray(req.auth?.permissions) &&
      req.auth.permissions.includes("deals:view_all"));

  const tenantId =
    req.tenantContext?.scope === "tenant" ? req.tenantContext.tenantId : null;

  const deal = await dealService.getDealById(
    req.params.id,
    tenantId,
    req.auth.userId,
    canViewAll,
  );

  res.json({ deal });
});

// Create a new deal
export const createDeal = asyncCatch(async (req, res) => {
  const dealData = {
    ...req.body,
    userId: req.user.userId,
  };

  if (req.tenantContext?.scope === "tenant") {
    dealData.tenantId = req.tenantContext.tenantId;
  }

  const deal = await dealService.createDeal(dealData);

  await fireWorkflowTrigger(req, "deal", "create", deal._id, deal.toObject());

  res.status(201).json({
    message: "Deal created successfully",
    deal,
  });
});

// Update deal
export const updateDeal = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    (Array.isArray(req.auth?.permissions) &&
      req.auth.permissions.includes("deals:view_all"));

  const tenantId =
    req.tenantContext?.scope === "tenant" ? req.tenantContext.tenantId : null;

  const { lastKnownUpdatedAt, ...updates } = req.body;
  const updatedDeal = await dealService.updateDeal(
    req.params.id,
    tenantId,
    req.auth.userId,
    canViewAll,
    updates,
    lastKnownUpdatedAt,
  );

  await fireWorkflowTrigger(
    req,
    "deal",
    "update",
    updatedDeal._id,
    updatedDeal.toObject(),
  );

  res.json({
    message: "Deal updated successfully",
    deal: updatedDeal,
  });
});

// Delete deal
export const deleteDeal = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    (Array.isArray(req.auth?.permissions) &&
      req.auth.permissions.includes("deals:view_all"));

  const tenantId =
    req.tenantContext?.scope === "tenant" ? req.tenantContext.tenantId : null;

  const deal = await dealService.deleteDeal(
    req.params.id,
    tenantId,
    req.auth.userId,
    canViewAll,
  );

  await fireWorkflowTrigger(req, "deal", "delete", deal._id, deal.toObject());

  res.json({ message: "Deal deleted successfully" });
});

// Get deals by tenant
export const getDealsByTenant = asyncCatch(async (req, res) => {
  if (
    req.tenantContext?.scope === "tenant" &&
    req.params.tenantId !== req.tenantContext.tenantId.toString()
  ) {
    throw new AppError(
      "Forbidden: You cannot access deals from other tenants",
      403,
    );
  }

  const deals = await dealService.getDealsByTenant(req.params.tenantId);

  res.json({
    count: deals.length,
    deals,
  });
});

// Get deals by user
export const getDealsByUser = asyncCatch(async (req, res) => {
  const tenantId =
    req.tenantContext?.scope === "tenant" ? req.tenantContext.tenantId : null;

  const deals = await dealService.getDealsByUser(req.params.userId, tenantId);

  res.json({
    count: deals.length,
    deals,
  });
});

// Get deals by lead
export const getDealsByLead = asyncCatch(async (req, res) => {
  const tenantId =
    req.tenantContext?.scope === "tenant" ? req.tenantContext.tenantId : null;

  const deals = await dealService.getDealsByLead(req.params.leadId, tenantId);

  res.json({
    count: deals.length,
    deals,
  });
});

// Get deals by organization
export const getDealsByOrganization = asyncCatch(async (req, res) => {
  const tenantId =
    req.tenantContext?.scope === "tenant" ? req.tenantContext.tenantId : null;

  const deals = await dealService.getDealsByOrganization(
    req.params.organizationId,
    tenantId,
  );

  res.json({
    count: deals.length,
    deals,
  });
});

// Search deals
export const searchDeals = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    (Array.isArray(req.auth?.permissions) &&
      req.auth.permissions.includes("deals:view_all"));

  const filter =
    req.tenantContext?.scope === "tenant"
      ? { tenantId: req.tenantContext.tenantId }
      : {};

  if (!canViewAll) {
    filter.userId = req.auth.userId;
  }

  const { q, limit = 25 } = req.query;

  const deals = await dealService.searchDeals(filter, { q, limit });

  res.json({ count: deals.length, deals });
});

// Update deal status
export const updateDealStatus = asyncCatch(async (req, res) => {
  const { status, lastKnownUpdatedAt } = req.body;

  const tenantId =
    req.tenantContext?.scope === "tenant" ? req.tenantContext.tenantId : null;

  const deal = await dealService.updateDealStatus(
    req.params.id,
    tenantId,
    status,
    lastKnownUpdatedAt,
  );

  await fireWorkflowTrigger(req, "deal", "update", deal._id, deal.toObject());

  res.json({
    message: "Deal status updated successfully",
    deal,
  });
});