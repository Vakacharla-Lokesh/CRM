import asyncCatch from "../utils/asyncCatch.js";
import AppError from "../utils/appError.js";
import * as bulkOperationService from "../services/bulkOperationService.js";

// Bulk create leads
export const bulkCreateLeads = asyncCatch(async (req, res) => {
  const leads = req.body.operations || req.body.leads;
  if (!Array.isArray(leads) || leads.length === 0) {
    throw new AppError("Invalid leads array", 400);
  }

  const result = await bulkOperationService.bulkCreateLeads(
    leads,
    req.user.userId,
    req.user.tenantId,
  );

  res.status(201).json({
    message: `Bulk create completed: ${result.created} created, ${result.skipped} already existed`,
    created: result.created,
    skipped: result.skipped,
    failed: 0,
    leads: result.items,
  });
});

// Bulk update leads
export const bulkUpdateLeads = asyncCatch(async (req, res) => {
  const updates = req.body.operations || req.body.updates;
  if (!Array.isArray(updates) || updates.length === 0) {
    throw new AppError("Invalid updates array", 400);
  }

  const result = await bulkOperationService.bulkUpdateLeads(updates);

  res.status(200).json({
    message: `Bulk update completed: ${result.updated} succeeded`,
    updated: result.updated,
    matched: result.matched,
    failed: result.failed,
  });
});

// Bulk create deals
export const bulkCreateDeals = asyncCatch(async (req, res) => {
  const deals = req.body.operations || req.body.deals;
  if (!Array.isArray(deals) || deals.length === 0) {
    throw new AppError("Invalid deals array", 400);
  }

  const result = await bulkOperationService.bulkCreateDeals(
    deals,
    req.user.userId,
    req.user.tenantId,
  );

  res.status(201).json({
    message: `Bulk create completed: ${result.created} created, ${result.skipped} already existed`,
    created: result.created,
    skipped: result.skipped,
    failed: 0,
    deals: result.items,
  });
});

// Bulk update deals
export const bulkUpdateDeals = asyncCatch(async (req, res) => {
  const updates = req.body.operations || req.body.updates;
  if (!Array.isArray(updates) || updates.length === 0) {
    throw new AppError("Invalid updates array", 400);
  }

  const result = await bulkOperationService.bulkUpdateDeals(updates);

  res.status(200).json({
    message: `Bulk update completed: ${result.updated} succeeded`,
    updated: result.updated,
    matched: result.matched,
    failed: result.failed,
  });
});

// Bulk create comments
export const bulkCreateComments = asyncCatch(async (req, res) => {
  const comments = req.body.operations || req.body.comments;
  if (!Array.isArray(comments) || comments.length === 0) {
    throw new AppError("Invalid comments array", 400);
  }

  const result = await bulkOperationService.bulkCreateComments(comments);

  res.status(201).json({
    message: `Bulk create completed: ${result.created} created, ${result.skipped} already existed`,
    created: result.created,
    skipped: result.skipped,
    failed: 0,
    comments: result.items,
  });
});

// Bulk create calls
export const bulkCreateCalls = asyncCatch(async (req, res) => {
  const calls = req.body.operations || req.body.calls;
  if (!Array.isArray(calls) || calls.length === 0) {
    throw new AppError("Invalid calls array", 400);
  }

  const result = await bulkOperationService.bulkCreateCalls(calls);

  res.status(201).json({
    message: `Bulk create completed: ${result.created} created, ${result.skipped} already existed`,
    created: result.created,
    skipped: result.skipped,
    failed: 0,
    calls: result.items,
  });
});

// Bulk create organizations
export const bulkCreateOrganizations = asyncCatch(async (req, res) => {
  const organizations = req.body.operations || req.body.organizations;
  if (!Array.isArray(organizations) || organizations.length === 0) {
    throw new AppError("Invalid organizations array", 400);
  }

  const result = await bulkOperationService.bulkCreateOrganizations(
    organizations,
    req.user.userId,
    req.user.tenantId,
  );

  res.status(201).json({
    message: `Bulk create completed: ${result.created} created, ${result.skipped} already existed`,
    created: result.created,
    skipped: result.skipped,
    failed: 0,
    organizations: result.items,
  });
});

// Bulk update organizations
export const bulkUpdateOrganizations = asyncCatch(async (req, res) => {
  const updates = req.body.operations || req.body.updates;
  if (!Array.isArray(updates) || updates.length === 0) {
    throw new AppError("Invalid updates array", 400);
  }

  const result = await bulkOperationService.bulkUpdateOrganizations(updates);

  res.status(200).json({
    message: `Bulk update completed: ${result.updated} succeeded`,
    updated: result.updated,
    matched: result.matched,
    failed: result.failed,
  });
});
