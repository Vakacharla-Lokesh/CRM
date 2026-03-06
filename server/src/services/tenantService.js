import crypto from "crypto";
import mongoose from "mongoose";
import tenantModel from "../models/tenantModel.js";
import userModel from "../models/userModel.js";
import AppError from "../utils/appError.js";

export const getAllTenants = async (filter, { limit = 20, cursor } = {}) => {
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
};

export const getTenantById = async (id) => {
  const tenant = await tenantModel.findById(id);
  if (!tenant) throw new AppError("Tenant not found", 404);
  return tenant;
};

export const createTenant = async (tenantData) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const tenant = await tenantModel.create([tenantData], { session });
    const randomPassword = crypto.randomBytes(6).toString("hex");
    const adminUser = await userModel.create(
      [
        {
          firstName: "admin",
          email: tenant[0].email,
          password: randomPassword,
          tenantId: tenant[0]._id,
          role: "admin",
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
};

export const updateTenant = async (id, updates) => {
  const tenant = await tenantModel.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!tenant) throw new AppError("Tenant not found", 404);
  return tenant;
};

export const deleteTenant = async (id) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const tenant = await tenantModel.findById(id).session(session);

    if (!tenant) {
      await session.abortTransaction();
      session.endSession();
      throw new AppError("Tenant not found", 404);
    }

    if (!tenant.isActive) {
      await session.abortTransaction();
      session.endSession();
      throw new AppError("Tenant is already inactive", 400);
    }

    await tenantModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { session },
    );

    await userModel.updateMany(
      { tenantId: id },
      { isActive: false },
      { session },
    );

    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

export const searchTenants = async (tenantFilter, { q, isActive, limit = 25 }) => {
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
};
