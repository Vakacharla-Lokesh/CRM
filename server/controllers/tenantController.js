import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import tenantModel from "../models/tenantModel.js";

// Get all tenants
export const getAllTenants = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};

// Get tenant by ID
export const getTenantById = async (req, res, next) => {
  try {
    const tenant = await tenantModel.findById(req.params.id);

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    res.json({ tenant });
  } catch (err) {
    next(err);
  }
};

// Create a new tenant
export const createTenant = async (req, res, next) => {
  try {
    const tenant = await tenantModel.create(req.body);

    res.status(201).json({
      message: "Tenant created successfully",
      tenant,
    });
  } catch (err) {
    next(err);
  }
};

// Update tenant
export const updateTenant = async (req, res, next) => {
  try {
    const tenant = await tenantModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    res.json({
      message: "Tenant updated successfully",
      tenant,
    });
  } catch (err) {
    next(err);
  }
};

// Delete tenant
export const deleteTenant = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const tenant = await tenantModel.findById(req.params.id).session(session);

    if (!tenant) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Tenant not found" });
    }

    if (!tenant.isActive) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Tenant is already inactive" });
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
    next(err);
  }
};
