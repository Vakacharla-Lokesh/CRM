import dealModel from "../models/dealModel.js";
import asyncCatch from "../utils/asyncCatch.js";
import AppError from "../utils/appError.js";
import { fireWorkflowTrigger } from "../middlewares/workflowTrigger.js";

import { bulkDeleteDeals } from "../services/bulkDeleteService.js";

// Get all deals
export const getAllDeals = asyncCatch(async (req, res) => {
  const filter =
    req.tenantContext?.scope === "tenant"
      ? { tenantId: req.tenantContext.tenantId }
      : {};
  const limit = parseInt(req.query.limit) || 20;
  const cursor = req.query.cursor;

  // Server-side filters
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.stage) {
    filter.status = req.query.stage;
  }

  if (cursor) {
    const lastId = Buffer.from(cursor, "base64").toString("utf8");
    filter._id = { $gt: lastId };
  }

  const deals = await dealModel
    .find(filter)
    .sort({ _id: 1 })
    .limit(limit + 1);

  const hasNextPage = deals.length > limit;
  if (hasNextPage) deals.pop();

  const nextCursor =
    hasNextPage && deals.length > 0
      ? Buffer.from(deals[deals.length - 1]._id.toString()).toString("base64")
      : null;

  res.json({ count: deals.length, deals, nextCursor, hasNextPage });
});

// Get deal by ID
export const getDealById = asyncCatch(async (req, res) => {
  const deal = await dealModel.findById(req.params.id);

  if (!deal) throw new AppError("Deal not found", 404);

  if (
    req.tenantContext?.scope === "tenant" &&
    deal.tenantId.toString() !== req.tenantContext.tenantId.toString()
  ) {
    throw new AppError("Forbidden: You cannot access this deal", 403);
  }

  res.json({ deal });
});

// Create a new deal
export const createDeal = asyncCatch(async (req, res) => {
  // Ensure userId from authenticated user
  const dealData = {
    ...req.body,
    userId: req.user.userId,
  };

  if (req.tenantContext?.scope === "tenant") {
    dealData.tenantId = req.tenantContext.tenantId;
  }

  const deal = await dealModel.create(dealData);

  await fireWorkflowTrigger(req, "deal", "create", deal._id, deal.toObject());

  res.status(201).json({
    message: "Deal created successfully",
    deal,
  });
});

// Update deal
export const updateDeal = asyncCatch(async (req, res) => {
  const deal = await dealModel.findById(req.params.id);

  if (!deal) throw new AppError("Deal not found", 404);

  if (
    req.tenantContext?.scope === "tenant" &&
    deal.tenantId.toString() !== req.tenantContext.tenantId.toString()
  ) {
    throw new AppError("Forbidden: You cannot update this deal", 403);
  }

  // Update deal
  const updatedDeal = await dealModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
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
  const deal = await dealModel.findById(req.params.id);

  if (!deal) throw new AppError("Deal not found", 404);

  if (
    req.tenantContext?.scope === "tenant" &&
    deal.tenantId.toString() !== req.tenantContext.tenantId.toString()
  ) {
    throw new AppError("Forbidden: You cannot delete this deal", 403);
  }

  await dealModel.findByIdAndDelete(req.params.id);

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

  const deals = await dealModel.find({ tenantId: req.params.tenantId });

  res.json({
    count: deals.length,
    deals,
  });
});

// Get deals by user
export const getDealsByUser = asyncCatch(async (req, res) => {
  const filter = { userId: req.params.userId };

  if (req.tenantContext?.scope === "tenant") {
    filter.tenantId = req.tenantContext.tenantId;
  }

  const deals = await dealModel.find(filter);

  res.json({
    count: deals.length,
    deals,
  });
});

// Get deals by lead
export const getDealsByLead = asyncCatch(async (req, res) => {
  const filter = { leadId: req.params.leadId };

  if (req.tenantContext?.scope === "tenant") {
    filter.tenantId = req.tenantContext.tenantId;
  }

  const deals = await dealModel.find(filter);

  res.json({
    count: deals.length,
    deals,
  });
});

// Get deals by organization
export const getDealsByOrganization = asyncCatch(async (req, res) => {
  const filter = { organizationId: req.params.organizationId };

  if (req.tenantContext?.scope === "tenant") {
    filter.tenantId = req.tenantContext.tenantId;
  }

  const deals = await dealModel.find(filter);

  res.json({
    count: deals.length,
    deals,
  });
});

// Search deals
export const searchDeals = asyncCatch(async (req, res) => {
  const filter =
    req.tenantContext?.scope === "tenant"
      ? { tenantId: req.tenantContext.tenantId }
      : {};
  const { q, limit = 25 } = req.query;

  if (!q || q.trim() === "") {
    throw new AppError("Search query 'q' is required", 400);
  }

  const searchRegex = new RegExp(q.trim(), "i");

  filter.$or = [{ name: searchRegex }];

  const deals = await dealModel
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(Math.min(parseInt(limit), 25));

  res.json({ count: deals.length, deals });
});

// Update deal status
export const updateDealStatus = asyncCatch(async (req, res) => {
  const { status } = req.body;
  const deal = await dealModel.findById(req.params.id);

  if (!deal) throw new AppError("Deal not found", 404);

  if (
    req.tenantContext?.scope === "tenant" &&
    deal.tenantId.toString() !== req.tenantContext.tenantId.toString()
  ) {
    throw new AppError("Forbidden: You cannot update this deal", 403);
  }

  deal.status = status;
  await deal.save();

  await fireWorkflowTrigger(req, "deal", "update", deal._id, deal.toObject());

  res.json({
    message: "Deal status updated successfully",
    deal,
  });
});

export const bulkDeleteDealsController = asyncCatch(async (req, res) => {
  const { ids } = req.body;
  const tenantId =
    req.tenantContext?.scope === "tenant" ? req.tenantContext.tenantId : null;
  const userContext = {
    userId: req.auth.userId,
    scope: req.tenantContext?.scope,
  };

  const result = await bulkDeleteDeals(ids, tenantId, userContext);

  res.json({
    message: "Bulk delete completed",
    ...result,
  });
});
