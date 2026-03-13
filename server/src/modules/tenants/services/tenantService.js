import crypto from "crypto";
import mongoose from "mongoose";
import tenantModel from "../models/tenantModel.js";
import userModel from "../../users/models/userModel.js";
import roleModel from "../../roles/models/roleModel.js";
import AppError from "../../../utils/appError.js";
import { wrapServiceFn } from "../../../utils/serviceWrapper.js";
import { DEFAULT_ROLE_PERMISSIONS } from "../../../utils/permissionPresets.js";

export const getAllTenants = wrapServiceFn(
  async (filter, { limit = 20, cursor } = {}) => {
    if (cursor) {
      const lastId = Buffer.from(cursor, "base64").toString("utf8");
      filter._id = { $gt: lastId };
    }

    const tenants = await tenantModel
      .find({ ...filter, isActive: true })
      .sort({ _id: 1 })
      .limit(limit + 1);

    const hasNextPage = tenants.length > limit;
    if (hasNextPage) tenants.pop();

    const nextCursor =
      hasNextPage && tenants.length > 0
        ? Buffer.from(tenants[tenants.length - 1]._id.toString()).toString(
            "base64",
          )
        : null;

    return { tenants, nextCursor, hasNextPage };
  },
);

export const getTenantById = wrapServiceFn(async (id) => {
  const tenant = await tenantModel.findById(id);
  if (!tenant) throw new AppError("Tenant not found", 404);
  return tenant;
});

export const createTenant = wrapServiceFn(async (tenantData) => {
  const session = await mongoose.startSession({
    readConcern: { level: "snapshot" },
    writeConcern: { w: "majority", j: true },
  });

  try {
    session.startTransaction();
    const tenant = await tenantModel.create([tenantData], { session });
    const tenantId = tenant[0]._id;

    // Create default roles for the new tenant
    await roleModel.insertMany(
      [
        {
          tenantId,
          name: "admin",
          description: "Full access administrator role",
          permissions: DEFAULT_ROLE_PERMISSIONS.admin,
        },
        {
          tenantId,
          name: "user",
          description: "Standard user role with basic access",
          permissions: DEFAULT_ROLE_PERMISSIONS.user,
        },
      ],
      { session },
    );

    const randomPassword = crypto.randomBytes(6).toString("hex");

    // Create permissions map from admin role permissions
    const adminPermissionsMap = new Map(
      DEFAULT_ROLE_PERMISSIONS.admin.map((permission) => [permission, true]),
    );

    const adminUser = await userModel.create(
      [
        {
          firstName: "admin",
          email: tenant[0].email,
          password: randomPassword,
          tenantId,
          role: "admin",
          permissions: adminPermissionsMap,
        },
      ],
      { session },
    );

    await session.commitTransaction();

    return { tenant: tenant[0], adminUser: adminUser[0], randomPassword };
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw err;
  } finally {
    session.endSession();
  }
});

export const updateTenant = wrapServiceFn(
  async (id, updates, lastKnownUpdatedAt) => {
    const tenant = await tenantModel.findById(id);
    if (!tenant) throw new AppError("Tenant not found", 404);

    if (lastKnownUpdatedAt) {
      const clientTimestamp = new Date(lastKnownUpdatedAt).getTime();
      const serverTimestamp = new Date(tenant.updatedAt).getTime();

      if (clientTimestamp !== serverTimestamp) {
        throw new AppError(
          "This tenant was modified by someone else. Please refresh and try again.",
          409,
        );
      }
    }

    const updatedTenant = await tenantModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!updatedTenant) throw new AppError("Tenant not found", 404);
    return updatedTenant;
  },
);

export const deleteTenant = wrapServiceFn(async (id) => {
  const tenant = await tenantModel.findById(id);

  if (!tenant) {
    throw new AppError("Tenant not found", 404);
  }

  if (tenant.isSystemTenant) {
    throw new AppError("Cannot delete the system tenant", 400);
  }

  if (!tenant.isActive) {
    throw new AppError("Tenant is already inactive", 400);
  }

  await tenantModel.findByIdAndUpdate(id, {
    isActive: false,
    deletedAt: new Date(),
  });

  await userModel.updateMany({ tenantId: id }, { isActive: false });
});

export const searchTenants = wrapServiceFn(
  async (tenantFilter, { q, isActive, limit = 25 }) => {
    if (!q || q.trim() === "") {
      throw new AppError("Search query 'q' is required", 400);
    }

    const parsedLimit = Math.min(parseInt(limit) || 25, 25);

    const pipeline = [
      {
        $search: {
          index: "tenant_search",
          compound: {
            must: [
              {
                text: {
                  query: q.trim(),
                  path: ["name", "email"],
                  fuzzy: {
                    maxEdits: 1,
                    prefixLength: 2,
                  },
                },
              },
            ],
            filter: [],
          },
        },
      },
    ];

    if (Object.keys(tenantFilter).length > 0) {
      pipeline[0].$search.compound.filter.push({
        equals: {
          path: Object.keys(tenantFilter)[0],
          value: Object.values(tenantFilter)[0],
        },
      });
    }

    if (typeof isActive !== "undefined") {
      pipeline[0].$search.compound.filter.push({
        equals: {
          path: "isActive",
          value: isActive === "true",
        },
      });
    }

    pipeline.push(
      {
        $limit: parsedLimit,
      },
      {
        $project: {
          name: 1,
          email: 1,
          mobile: 1,
          isActive: 1,
          createdAt: 1,
          updatedAt: 1,
          score: { $meta: "searchScore" },
        },
      },
    );

    return tenantModel.aggregate(pipeline);
  },
);

export const getPublicTenants = wrapServiceFn(async () => {
  return tenantModel
    .find({ isActive: true })
    .select("_id name")
    .sort({ name: 1 })
    .lean();
});
