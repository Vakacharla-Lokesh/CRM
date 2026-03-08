import emailController from "./emailController.js";
import asyncCatch from "../utils/asyncCatch.js";
import * as tenantService from "../services/tenantService.js";

// Get all tenants
export const getAllTenants = asyncCatch(async (req, res) => {
  const filter = {};
  const limit = parseInt(req.query.limit) || 20;
  const cursor = req.query.cursor;

  // Server-side search filter
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, "i");
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { mobile: searchRegex },
    ];
  }

  const { tenants, nextCursor, hasNextPage } =
    await tenantService.getAllTenants(filter, { limit, cursor });

  res.json({ count: tenants.length, tenants, nextCursor, hasNextPage });
});

// Get tenant by ID
export const getTenantById = asyncCatch(async (req, res) => {
  const tenant = await tenantService.getTenantById(req.params.id);

  res.json({ tenant });
});

// Create a new tenant
export const createTenant = asyncCatch(async (req, res) => {
  const { tenant, adminUser, randomPassword } =
    await tenantService.createTenant(req.body);

  try {
    await emailController.sendAdminMail(adminUser, randomPassword);
  } catch (emailErr) {
    console.error("Failed to send admin welcome email:", emailErr.message);
  }

  res.status(201).json({
    message: "Tenant and admin created successfully",
    tenant,
  });
});

// Update tenant
export const updateTenant = asyncCatch(async (req, res) => {
  const { lastKnownUpdatedAt, ...updates } = req.body;
  const tenant = await tenantService.updateTenant(
    req.params.id,
    updates,
    lastKnownUpdatedAt,
  );

  res.json({
    message: "Tenant updated successfully",
    tenant,
  });
});

// Delete tenant
export const deleteTenant = asyncCatch(async (req, res) => {
  await tenantService.deleteTenant(req.params.id);

  res.json({ message: "Tenant deactivated successfully" });
});

// search tenants
export const searchTenants = asyncCatch(async (req, res) => {
  const tenantFilter = req.tenantFilter || {};
  const { q, isActive, limit = 25 } = req.query;

  const tenants = await tenantService.searchTenants(tenantFilter, {
    q,
    isActive,
    limit,
  });

  res.json({
    count: tenants.length,
    tenants,
  });
});

export const getPublicTenants = asyncCatch(async (req, res) => {
  const tenants = await tenantService.getPublicTenants();
  res.json({ tenants });
});
