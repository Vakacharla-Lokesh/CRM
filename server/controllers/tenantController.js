import crypto from "crypto";
import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import tenantModel from "../models/tenantModel.js";
import emailController from "./emailController.js";
import asyncCatch from "../utils/asyncCatch.js";
import AppError from "../utils/AppError.js";

// Get all tenants
export const getAllTenants = asyncCatch(async (req, res) => {
  const filter = {};
  const limit = parseInt(req.query.limit) || 20;
  const cursor = req.query.cursor;

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
          userEmail: tenant[0].email,
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
  const tenant = await tenantModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );

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
