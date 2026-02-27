import organizationModel from "../models/organizationModel.js";
import asyncCatch from "../utils/asyncCatch.js";
import AppError from "../utils/AppError.js";
import { fireWorkflowTrigger } from "../middlewares/workflowTrigger.js";

export const getAllOrganizations = asyncCatch(async (req, res) => {
  const filter = req.tenantFilter || {};
  const limit = parseInt(req.query.limit) || 20;
  const cursor = req.query.cursor;

  if (cursor) {
    const lastId = Buffer.from(cursor, "base64").toString("utf8");
    filter._id = { $gt: lastId };
  }

  const organizations = await organizationModel
    .find(filter)
    .sort({ _id: 1 })
    .limit(limit + 1);

  const hasNextPage = organizations.length > limit;
  if (hasNextPage) organizations.pop();

  const nextCursor =
    hasNextPage && organizations.length > 0
      ? Buffer.from(
          organizations[organizations.length - 1]._id.toString(),
        ).toString("base64")
      : null;

  res.json({
    count: organizations.length,
    organizations,
    nextCursor,
    hasNextPage,
  });
});

export const getOrganizationById = asyncCatch(async (req, res) => {
  const organization = await organizationModel.findById(req.params.id);

  if (!organization) throw new AppError("Organization not found", 404);

  if (
    req.user.role !== "super_admin" &&
    organization.tenantId.toString() !== req.user.tenantId
  ) {
    throw new AppError("Forbidden: You cannot access this organization", 403);
  }

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

  const organization = await organizationModel.create(organizationData);

  await fireWorkflowTrigger(
    req,
    "organization",
    "create",
    organization._id,
    organization.toObject(),
  );

  res.status(201).json({
    message: "Organization created successfully",
    organization,
  });
});

// Update organization
export const updateOrganization = asyncCatch(async (req, res) => {
  const organization = await organizationModel.findById(req.params.id);

  if (!organization) throw new AppError("Organization not found", 404);

  // Check tenant access for non-super_admin
  if (
    req.user.role !== "super_admin" &&
    organization.tenantId.toString() !== req.user.tenantId
  ) {
    throw new AppError("Forbidden: You cannot update this organization", 403);
  }

  // Update organization
  const updatedOrganization = await organizationModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );

  await fireWorkflowTrigger(
    req,
    "organization",
    "update",
    updatedOrganization._id,
    updatedOrganization.toObject(),
  );

  res.json({
    message: "Organization updated successfully",
    organization: updatedOrganization,
  });
});

// Delete organization
export const deleteOrganization = asyncCatch(async (req, res) => {
  const organization = await organizationModel.findById(req.params.id);

  if (!organization) throw new AppError("Organization not found", 404);

  if (
    req.user.role !== "super_admin" &&
    organization.tenantId.toString() !== req.user.tenantId
  ) {
    throw new AppError("Forbidden: You cannot delete this organization", 403);
  }

  await organizationModel.findByIdAndDelete(req.params.id);

  await fireWorkflowTrigger(
    req,
    "organization",
    "delete",
    organization._id,
    organization.toObject(),
  );

  res.json({ message: "Organization deleted successfully" });
});

// Get organizations by tenant
export const getOrganizationsByTenant = asyncCatch(async (req, res) => {
  // Check tenant access
  if (
    req.user.role !== "super_admin" &&
    req.params.tenantId !== req.user.tenantId
  ) {
    throw new AppError(
      "Forbidden: You cannot access organizations from other tenants",
      403,
    );
  }

  const organizations = await organizationModel.find({
    tenantId: req.params.tenantId,
  });

  res.json({
    count: organizations.length,
    organizations,
  });
});

// Get organizations by user
export const getOrganizationsByUser = asyncCatch(async (req, res) => {
  const filter = { userId: req.params.userId };

  // Add tenant filter for non-super_admin
  if (req.user.role !== "super_admin") {
    filter.tenantId = req.user.tenantId;
  }

  const organizations = await organizationModel.find(filter);

  res.json({
    count: organizations.length,
    organizations,
  });
});

export const searchOrganizations = asyncCatch(async (req, res) => {
  const filter = req.tenantFilter || {};
  const { q, status, source, limit = 25 } = req.query;

  if (!q || q.trim() === "") {
    throw new AppError("Search query 'q' is required", 400);
  }

  const searchRegex = new RegExp(q.trim(), "i");

  filter.$or = [
    { organizationName: searchRegex },
    { organizationWebsite: searchRegex },
    { organizationIndustry: searchRegex },
  ];

  const organizations = await organizationModel
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(Math.min(parseInt(limit), 25));

  res.json({ count: organizations.length, organizations });
});
