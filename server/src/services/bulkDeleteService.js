import mongoose from "mongoose";
import AppError from "../utils/AppError.js";

import leadModel from "../models/leadModel.js";
import organizationModel from "../models/organizationModel.js";
import dealModel from "../models/dealModel.js";

const MAX_BULK_DELETE_IDS = 50;

export async function bulkDeleteDeals(ids, tenantId, userContext) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError("ids array is required and must not be empty", 400);
  }

  if (ids.length > MAX_BULK_DELETE_IDS) {
    throw new AppError(
      `Cannot delete more than ${MAX_BULK_DELETE_IDS} deals at once`,
      400,
    );
  }

  // Validate ObjectId format
  const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
  if (invalidIds.length > 0) {
    throw new AppError(
      `Invalid ObjectId format: ${invalidIds.join(", ")}`,
      400,
    );
  }

  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));

  // Build filter with tenant isolation
  const filter = {
    _id: { $in: objectIds },
  };

  // Tenant enforcement — never trust client tenantId
  if (userContext.role !== "super_admin") {
    filter.tenantId = new mongoose.Types.ObjectId(tenantId);
  }

  // Find matching deals first to identify failures
  const matchingDeals = await dealModel.find(filter).select("_id").lean();

  const matchedIds = new Set(matchingDeals.map((d) => d._id.toString()));
  const failedIds = ids.filter((id) => !matchedIds.has(id));

  if (matchingDeals.length === 0) {
    return {
      totalRequested: ids.length,
      totalDeleted: 0,
      failedIds: ids,
    };
  }

  // Perform delete
  const result = await dealModel.deleteMany({
    _id: { $in: matchingDeals.map((d) => d._id) },
  });

  console.log(
    `[BulkDelete:Deals] userId=${userContext.userId} tenantId=${tenantId} deletedCount=${result.deletedCount} requested=${ids.length}`,
  );

  return {
    totalRequested: ids.length,
    totalDeleted: result.deletedCount,
    failedIds,
  };
}

export async function bulkDeleteLeads(ids, tenantId, userContext) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError("ids array is required and must not be empty", 400);
  }

  if (ids.length > MAX_BULK_DELETE_IDS) {
    throw new AppError(
      `Cannot delete more than ${MAX_BULK_DELETE_IDS} leads at once`,
      400,
    );
  }

  // Validate ObjectId format
  const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
  if (invalidIds.length > 0) {
    throw new AppError(
      `Invalid ObjectId format: ${invalidIds.join(", ")}`,
      400,
    );
  }

  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));

  // Build filter with tenant isolation
  const filter = {
    _id: { $in: objectIds },
  };

  // Tenant enforcement — never trust client tenantId
  if (userContext.role !== "super_admin") {
    filter.tenantId = new mongoose.Types.ObjectId(tenantId);
  }

  // Find matching leads first to identify failures
  const matchingLeads = await leadModel.find(filter).select("_id").lean();

  const matchedIds = new Set(matchingLeads.map((l) => l._id.toString()));
  const failedIds = ids.filter((id) => !matchedIds.has(id));

  if (matchingLeads.length === 0) {
    return {
      totalRequested: ids.length,
      totalDeleted: 0,
      failedIds: ids,
    };
  }

  // Perform delete
  const result = await leadModel.deleteMany({
    _id: { $in: matchingLeads.map((l) => l._id) },
  });

  console.log(
    `[BulkDelete:Leads] userId=${userContext.userId} tenantId=${tenantId} deletedCount=${result.deletedCount} requested=${ids.length}`,
  );

  return {
    totalRequested: ids.length,
    totalDeleted: result.deletedCount,
    failedIds,
  };
}

export async function bulkDeleteOrganizations(ids, tenantId, userContext) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError("ids array is required and must not be empty", 400);
  }

  if (ids.length > MAX_BULK_DELETE_IDS) {
    throw new AppError(
      `Cannot delete more than ${MAX_BULK_DELETE_IDS} organizations at once`,
      400,
    );
  }

  // Validate ObjectId format
  const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
  if (invalidIds.length > 0) {
    throw new AppError(
      `Invalid ObjectId format: ${invalidIds.join(", ")}`,
      400,
    );
  }

  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));

  // Build filter with tenant isolation
  const filter = {
    _id: { $in: objectIds },
  };

  // Tenant enforcement — never trust client tenantId
  if (userContext.role !== "super_admin") {
    filter.tenantId = new mongoose.Types.ObjectId(tenantId);
  }



  // Find matching organizations first to identify failures
  const matchingOrgs = await organizationModel
    .find(filter)
    .select("_id")
    .lean();

  const matchedIds = new Set(matchingOrgs.map((o) => o._id.toString()));
  const failedIds = ids.filter((id) => !matchedIds.has(id));

  if (matchingOrgs.length === 0) {
    return {
      totalRequested: ids.length,
      totalDeleted: 0,
      failedIds: ids,
    };
  }

  // Perform delete
  const result = await organizationModel.deleteMany({
    _id: { $in: matchingOrgs.map((o) => o._id) },
  });

  console.log(
    `[BulkDelete:Organizations] userId=${userContext.userId} tenantId=${tenantId} deletedCount=${result.deletedCount} requested=${ids.length}`,
  );

  return {
    totalRequested: ids.length,
    totalDeleted: result.deletedCount,
    failedIds,
  };
}
