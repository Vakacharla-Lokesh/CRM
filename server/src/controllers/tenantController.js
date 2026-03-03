import crypto from "crypto";
import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import tenantModel from "../models/tenantModel.js";
import emailController from "./emailController.js";
import asyncCatch from "../utils/asyncCatch.js";
import AppError from "../utils/appError.js";

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

  res.json({ count: tenants.length, tenants, nextCursor, hasNextPage });
});

// Get tenant by ID
export const getTenantById = asyncCatch(async (req, res) => {
  const tenant = await tenantModel.findById(req.params.id);

  if (!tenant) throw new AppError("Tenant not found", 404);

  res.json({ tenant });
});

// Create a new tenant
export const createTenant = asyncCatch(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const tenant = await tenantModel.create([req.body], { session });
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

    try {
      await emailController.sendAdminMail(adminUser[0], randomPassword);
    } catch (emailErr) {
      console.error("Failed to send admin welcome email:", emailErr.message);
    }

    res.status(201).json({
      message: "Tenant and admin created successfully",
      tenant: tenant[0],
    });
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw err;
  } finally {
    session.endSession();
  }
});

// Update tenant
export const updateTenant = asyncCatch(async (req, res) => {
  const tenant = await tenantModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tenant) throw new AppError("Tenant not found", 404);

  res.json({
    message: "Tenant updated successfully",
    tenant,
  });
});

// Delete tenant
export const deleteTenant = asyncCatch(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const tenant = await tenantModel.findById(req.params.id).session(session);

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

    // Soft delete tenant
    await tenantModel.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { session },
    );

    // Cascade: deactivate all users in this tenant
    await userModel.updateMany(
      { tenantId: req.params.id },
      { isActive: false },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Tenant deactivated successfully" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

// search tenants
export const searchTenants = asyncCatch(async (req, res) => {
  const tenantFilter = req.tenantFilter || {};
  const { q, isActive, limit = 25 } = req.query;

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

  // Apply tenant-level filtering (multi-tenant safety)
  if (Object.keys(tenantFilter).length > 0) {
    pipeline[0].$search.compound.filter.push({
      equals: {
        path: Object.keys(tenantFilter)[0],
        value: Object.values(tenantFilter)[0],
      },
    });
  }

  // Optional active filter
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

  const tenants = await tenantModel.aggregate(pipeline);

  res.json({
    count: tenants.length,
    tenants,
  });
});
