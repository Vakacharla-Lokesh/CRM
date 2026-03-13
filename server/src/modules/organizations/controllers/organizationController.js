import asyncCatch from "../../../utils/asyncCatch.js";
import AppError from "../../../utils/appError.js";
import * as organizationService from "../services/organizationService.js";
import { fireWorkflowTrigger } from "../../../services/workflowTrigger.js";

export const getAllOrganizations = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    (Array.isArray(req.auth?.permissions) &&
      req.auth.permissions.includes("organizations:view_all"));

  const filter = req.tenantFilter || {};

  if (!canViewAll) {
    filter.userId = req.auth.userId;
  }

  if (req.query.industry) {
    filter.industry = req.query.industry;
  }

  const limit = parseInt(req.query.limit) || 20;
  const cursor = req.query.cursor;

  const { organizations, nextCursor, hasNextPage } =
    await organizationService.getAllOrganizations(filter, { limit, cursor });

  res.json({
    count: organizations.length,
    organizations,
    nextCursor,
    hasNextPage,
  });
});

export const getOrganizationById = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    (Array.isArray(req.auth?.permissions) &&
      req.auth.permissions.includes("organizations:view_all"));

  const tenantId =
    req.tenantContext?.scope === "tenant" ? req.tenantContext.tenantId : null;

  const organization = await organizationService.getOrganizationById(
    req.params.id,
    tenantId,
    req.auth.userId,
    canViewAll,
  );

  res.json({ organization });
});

export const createOrganization = asyncCatch(async (req, res) => {
  const organizationData = {
    ...req.body,
    userId: req.user.userId,
  };

  if (!organizationData.tenantId) {
    organizationData.tenantId = req.user.tenantId;
  } else if (req.user.role !== "super_admin") {
    organizationData.tenantId = req.user.tenantId;
  }

  const organization =
    await organizationService.createOrganization(organizationData);

  res.status(201).json({
    message: "Organization created successfully",
    organization,
  });

  await fireWorkflowTrigger(
    req,
    "organization",
    "create",
    organization._id,
    organization.toObject(),
  );
});

export const updateOrganization = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    (Array.isArray(req.auth?.permissions) &&
      req.auth.permissions.includes("organizations:view_all"));

  const tenantId =
    req.tenantContext?.scope === "tenant" ? req.tenantContext.tenantId : null;

  const { lastKnownUpdatedAt, ...updates } = req.body;
  const updatedOrganization = await organizationService.updateOrganization(
    req.params.id,
    tenantId,
    req.auth.userId,
    canViewAll,
    updates,
    lastKnownUpdatedAt,
  );

  res.json({
    message: "Organization updated successfully",
    organization: updatedOrganization,
  });

  await fireWorkflowTrigger(
    req,
    "organization",
    "update",
    updatedOrganization._id,
    updatedOrganization.toObject(),
  );
});

export const deleteOrganization = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    (Array.isArray(req.auth?.permissions) &&
      req.auth.permissions.includes("organizations:view_all"));

  const tenantId =
    req.tenantContext?.scope === "tenant" ? req.tenantContext.tenantId : null;

  const organization = await organizationService.deleteOrganization(
    req.params.id,
    tenantId,
    req.auth.userId,
    canViewAll,
  );

  res.json({ message: "Organization deleted successfully" });

  await fireWorkflowTrigger(
    req,
    "organization",
    "delete",
    organization._id,
    organization.toObject(),
  );
});

export const getOrganizationsByTenant = asyncCatch(async (req, res) => {
  if (
    req.user.role !== "super_admin" &&
    req.params.tenantId !== req.user.tenantId
  ) {
    throw new AppError(
      "Forbidden: You cannot access organizations from other tenants",
      403,
    );
  }

  const organizations = await organizationService.getOrganizationsByTenant(
    req.params.tenantId,
  );

  res.json({
    count: organizations.length,
    organizations,
  });
});

export const getOrganizationsByUser = asyncCatch(async (req, res) => {
  const tenantId = req.user.role !== "super_admin" ? req.user.tenantId : null;

  const organizations = await organizationService.getOrganizationsByUser(
    req.params.userId,
    tenantId,
  );

  res.json({
    count: organizations.length,
    organizations,
  });
});

export const searchOrganizations = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    (Array.isArray(req.auth?.permissions) &&
      req.auth.permissions.includes("organizations:view_all"));

  const filter = req.tenantFilter || {};
  const { q, limit = 25 } = req.query;

  if (!canViewAll) {
    filter.userId = req.auth.userId;
  }

  const organizations = await organizationService.searchOrganizations(filter, {
    q,
    limit,
  });

  res.json({ count: organizations.length, organizations });
});
