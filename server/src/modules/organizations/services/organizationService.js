import organizationModel from "../models/organizationModel.js";
import AppError from "../../../utils/appError.js";
import { wrapServiceFn } from "../../../utils/serviceWrapper.js";

export const getAllOrganizations = wrapServiceFn(
  async (filter, { limit = 20, cursor } = {}) => {
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

    return { organizations, nextCursor, hasNextPage };
  },
);

export const getOrganizationById = wrapServiceFn(
  async (id, tenantId, userId, canViewAll) => {
    const organization = await organizationModel.findById(id);
    if (!organization) throw new AppError("Organization not found", 404);

    if (tenantId && organization.tenantId.toString() !== tenantId.toString()) {
      throw new AppError("Forbidden: You cannot access this organization", 403);
    }

    if (!canViewAll && organization.userId.toString() !== userId.toString()) {
      throw new AppError("Forbidden: You cannot access this organization", 403);
    }

    return organization;
  },
);

export const createOrganization = wrapServiceFn(async (organizationData) => {
  return organizationModel.create(organizationData);
});

export const updateOrganization = wrapServiceFn(
  async (id, tenantId, userId, canViewAll, updates, lastKnownUpdatedAt) => {
    const organization = await organizationModel.findById(id);
    if (!organization) throw new AppError("Organization not found", 404);

    if (tenantId && organization.tenantId.toString() !== tenantId.toString()) {
      throw new AppError("Forbidden: You cannot update this organization", 403);
    }

    if (!canViewAll && organization.userId.toString() !== userId.toString()) {
      throw new AppError("Forbidden: You cannot update this organization", 403);
    }

    if (lastKnownUpdatedAt) {
      const clientTimestamp = new Date(lastKnownUpdatedAt).getTime();
      const serverTimestamp = new Date(organization.updatedAt).getTime();

      if (clientTimestamp !== serverTimestamp) {
        throw new AppError(
          "This organization was modified by someone else. Please refresh and try again.",
          409,
        );
      }
    }

    return organizationModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
  },
);

export const deleteOrganization = wrapServiceFn(
  async (id, tenantId, userId, canViewAll) => {
    const organization = await organizationModel.findById(id);
    if (!organization) throw new AppError("Organization not found", 404);

    if (tenantId && organization.tenantId.toString() !== tenantId.toString()) {
      throw new AppError("Forbidden: You cannot delete this organization", 403);
    }

    if (!canViewAll && organization.userId.toString() !== userId.toString()) {
      throw new AppError("Forbidden: You cannot delete this organization", 403);
    }

    await organizationModel.findByIdAndDelete(id);
    return organization;
  },
);

export const getOrganizationsByTenant = wrapServiceFn(async (tenantId) => {
  return organizationModel.find({ tenantId });
});

export const getOrganizationsByUser = wrapServiceFn(
  async (userId, tenantId) => {
    const filter = { userId };
    if (tenantId) filter.tenantId = tenantId;
    return organizationModel.find(filter);
  },
);

export const searchOrganizations = wrapServiceFn(
  async (filter, { q, limit = 25 }) => {
    if (!q || q.trim() === "") {
      throw new AppError("Search query 'q' is required", 400);
    }

    const searchRegex = new RegExp(q.trim(), "i");

    filter.$or = [
      { name: searchRegex },
      { website: searchRegex },
      { industry: searchRegex },
    ];

    return organizationModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(parseInt(limit), 25));
  },
);
