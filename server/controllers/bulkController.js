import mongoose from "mongoose";
import leadModel from "../models/leadModel.js";
import dealModel from "../models/dealModel.js";
import commentModel from "../models/commentModel.js";
import callModel from "../models/callModel.js";
import organizationModel from "../models/organizationModel.js";

// Bulk create leads using MongoDB insertMany with transaction
export const bulkCreateLeads = async (req, res, next) => {
  const { leads } = req.body;

  if (!Array.isArray(leads) || leads.length === 0) {
    return res.status(400).json({ message: "Invalid leads array" });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const leadData = leads.map((lead) => ({
      ...lead,
      userId: lead.userId || req.user.userId,
      tenantId: lead.tenantId || req.user.tenantId,
    }));

    const createdLeads = await leadModel.insertMany(leadData, {
      session,
      ordered: true,
    });

    await session.commitTransaction();

    res.status(201).json({
      message: `Bulk create completed: ${createdLeads.length} succeeded`,
      created: createdLeads.length,
      failed: 0,
      leads: createdLeads,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// Bulk update leads using MongoDB bulkWrite with transaction
export const bulkUpdateLeads = async (req, res, next) => {
  const { updates } = req.body;

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ message: "Invalid updates array" });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const bulkOps = updates.map((update) => {
      const { id, ...updateData } = update;
      return {
        updateOne: {
          filter: { _id: id },
          update: { $set: updateData },
        },
      };
    });

    const result = await leadModel.bulkWrite(bulkOps, {
      session,
      ordered: true,
    });

    await session.commitTransaction();

    res.status(200).json({
      message: `Bulk update completed: ${result.modifiedCount} succeeded`,
      updated: result.modifiedCount,
      matched: result.matchedCount,
      failed: updates.length - result.matchedCount,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// Bulk create deals using MongoDB insertMany with transaction
export const bulkCreateDeals = async (req, res, next) => {
  const { deals } = req.body;

  if (!Array.isArray(deals) || deals.length === 0) {
    return res.status(400).json({ message: "Invalid deals array" });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const dealData = deals.map((deal) => ({
      ...deal,
      userId: deal.userId || req.user.userId,
      tenantId: deal.tenantId || req.user.tenantId,
    }));

    const createdDeals = await dealModel.insertMany(dealData, {
      session,
      ordered: true,
    });

    await session.commitTransaction();

    res.status(201).json({
      message: `Bulk create completed: ${createdDeals.length} succeeded`,
      created: createdDeals.length,
      failed: 0,
      deals: createdDeals,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// Bulk update deals using MongoDB bulkWrite with transaction
export const bulkUpdateDeals = async (req, res, next) => {
  const { updates } = req.body;

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ message: "Invalid updates array" });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const bulkOps = updates.map((update) => {
      const { id, ...updateData } = update;
      return {
        updateOne: {
          filter: { _id: id },
          update: { $set: updateData },
        },
      };
    });

    const result = await dealModel.bulkWrite(bulkOps, {
      session,
      ordered: true,
    });

    await session.commitTransaction();

    res.status(200).json({
      message: `Bulk update completed: ${result.modifiedCount} succeeded`,
      updated: result.modifiedCount,
      matched: result.matchedCount,
      failed: updates.length - result.matchedCount,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// Bulk create comments using MongoDB insertMany with transaction
export const bulkCreateComments = async (req, res, next) => {
  const { comments } = req.body;

  if (!Array.isArray(comments) || comments.length === 0) {
    return res.status(400).json({ message: "Invalid comments array" });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const createdComments = await commentModel.insertMany(comments, {
      session,
      ordered: true,
    });

    await session.commitTransaction();

    res.status(201).json({
      message: `Bulk create completed: ${createdComments.length} succeeded`,
      created: createdComments.length,
      failed: 0,
      comments: createdComments,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// Bulk create calls using MongoDB insertMany with transaction
export const bulkCreateCalls = async (req, res, next) => {
  const { calls } = req.body;

  if (!Array.isArray(calls) || calls.length === 0) {
    return res.status(400).json({ message: "Invalid calls array" });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const createdCalls = await callModel.insertMany(calls, {
      session,
      ordered: true,
    });

    await session.commitTransaction();

    res.status(201).json({
      message: `Bulk create completed: ${createdCalls.length} succeeded`,
      created: createdCalls.length,
      failed: 0,
      calls: createdCalls,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// Bulk create organizations using MongoDB insertMany with transaction
export const bulkCreateOrganizations = async (req, res, next) => {
  const { organizations } = req.body;

  if (!Array.isArray(organizations) || organizations.length === 0) {
    return res.status(400).json({ message: "Invalid organizations array" });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const organizationData = organizations.map((org) => ({
      ...org,
      userId: org.userId || req.user.userId,
      tenantId: org.tenantId || req.user.tenantId,
    }));

    const createdOrganizations = await organizationModel.insertMany(
      organizationData,
      { session, ordered: true },
    );

    await session.commitTransaction();

    res.status(201).json({
      message: `Bulk create completed: ${createdOrganizations.length} succeeded`,
      created: createdOrganizations.length,
      failed: 0,
      organizations: createdOrganizations,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// Bulk update organizations using MongoDB bulkWrite with transaction
export const bulkUpdateOrganizations = async (req, res, next) => {
  const { updates } = req.body;

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ message: "Invalid updates array" });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const bulkOps = updates.map((update) => {
      const { id, ...updateData } = update;
      return {
        updateOne: {
          filter: { _id: id },
          update: { $set: updateData },
        },
      };
    });

    const result = await organizationModel.bulkWrite(bulkOps, {
      session,
      ordered: true,
    });

    await session.commitTransaction();

    res.status(200).json({
      message: `Bulk update completed: ${result.modifiedCount} succeeded`,
      updated: result.modifiedCount,
      matched: result.matchedCount,
      failed: updates.length - result.matchedCount,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};
