import mongoose from "mongoose";
import asyncCatch from "../utils/asyncCatch.js";
import AppError from "../utils/AppError.js";
import leadModel from "../models/leadModel.js";
import dealModel from "../models/dealModel.js";
import commentModel from "../models/commentModel.js";
import callModel from "../models/callModel.js";
import organizationModel from "../models/organizationModel.js";

// Bulk create leads using MongoDB insertMany with transaction
export const bulkCreateLeads = asyncCatch(async (req, res) => {
  const leads = req.body.operations || req.body.leads;

  if (!Array.isArray(leads) || leads.length === 0) {
    throw new AppError("Invalid leads array", 400);
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const leadData = leads.map((lead) => ({
      ...lead,
      userId: lead.userId || req.user.userId,
      tenantId: lead.tenantId || req.user.tenantId,
    }));

    // Deduplicate by idempotency key so retried offline syncs never create duplicates
    const idempotencyKeys = leadData.map((l) => l.idempotencyKey).filter(Boolean);
    const alreadyProcessed = new Set();
    if (idempotencyKeys.length > 0) {
      const existing = await leadModel
        .find({ idempotencyKey: { $in: idempotencyKeys } })
        .select("idempotencyKey")
        .lean()
        .session(session);
      existing.forEach((e) => alreadyProcessed.add(e.idempotencyKey));
    }
    const newLeads = leadData.filter(
      (l) => !l.idempotencyKey || !alreadyProcessed.has(l.idempotencyKey),
    );
    const skippedCount = leadData.length - newLeads.length;

    const createdLeads =
      newLeads.length > 0
        ? await leadModel.insertMany(newLeads, { session, ordered: true })
        : [];

    await session.commitTransaction();

    res.status(201).json({
      message: `Bulk create completed: ${createdLeads.length} created, ${skippedCount} already existed`,
      created: createdLeads.length,
      skipped: skippedCount,
      failed: 0,
      leads: createdLeads,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// Bulk update leads using MongoDB bulkWrite with transaction
export const bulkUpdateLeads = asyncCatch(async (req, res) => {
  const updates = req.body.operations || req.body.updates;

  if (!Array.isArray(updates) || updates.length === 0) {
    throw new AppError("Invalid updates array", 400);
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
    throw error;
  } finally {
    session.endSession();
  }
});

// Bulk create deals using MongoDB insertMany with transaction
export const bulkCreateDeals = asyncCatch(async (req, res) => {
  const deals = req.body.operations || req.body.deals;

  if (!Array.isArray(deals) || deals.length === 0) {
    throw new AppError("Invalid deals array", 400);
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const dealData = deals.map((deal) => ({
      ...deal,
      userId: deal.userId || req.user.userId,
      tenantId: deal.tenantId || req.user.tenantId,
    }));

    // Deduplicate by idempotency key so retried offline syncs never create duplicates
    const idempotencyKeys = dealData.map((d) => d.idempotencyKey).filter(Boolean);
    const alreadyProcessed = new Set();
    if (idempotencyKeys.length > 0) {
      const existing = await dealModel
        .find({ idempotencyKey: { $in: idempotencyKeys } })
        .select("idempotencyKey")
        .lean()
        .session(session);
      existing.forEach((e) => alreadyProcessed.add(e.idempotencyKey));
    }
    const newDeals = dealData.filter(
      (d) => !d.idempotencyKey || !alreadyProcessed.has(d.idempotencyKey),
    );
    const skippedCount = dealData.length - newDeals.length;

    const createdDeals =
      newDeals.length > 0
        ? await dealModel.insertMany(newDeals, { session, ordered: true })
        : [];

    await session.commitTransaction();

    res.status(201).json({
      message: `Bulk create completed: ${createdDeals.length} created, ${skippedCount} already existed`,
      created: createdDeals.length,
      skipped: skippedCount,
      failed: 0,
      deals: createdDeals,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// Bulk update deals using MongoDB bulkWrite with transaction
export const bulkUpdateDeals = asyncCatch(async (req, res) => {
  const updates = req.body.operations || req.body.updates;

  if (!Array.isArray(updates) || updates.length === 0) {
    throw new AppError("Invalid updates array", 400);
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
    throw error;
  } finally {
    session.endSession();
  }
});

// Bulk create comments using MongoDB insertMany with transaction
export const bulkCreateComments = asyncCatch(async (req, res) => {
  const comments = req.body.operations || req.body.comments;

  if (!Array.isArray(comments) || comments.length === 0) {
    throw new AppError("Invalid comments array", 400);
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Deduplicate by idempotency key so retried offline syncs never create duplicates
    const idempotencyKeys = comments.map((c) => c.idempotencyKey).filter(Boolean);
    const alreadyProcessed = new Set();
    if (idempotencyKeys.length > 0) {
      const existing = await commentModel
        .find({ idempotencyKey: { $in: idempotencyKeys } })
        .select("idempotencyKey")
        .lean()
        .session(session);
      existing.forEach((e) => alreadyProcessed.add(e.idempotencyKey));
    }
    const newComments = comments.filter(
      (c) => !c.idempotencyKey || !alreadyProcessed.has(c.idempotencyKey),
    );
    const skippedCount = comments.length - newComments.length;

    const createdComments =
      newComments.length > 0
        ? await commentModel.insertMany(newComments, { session, ordered: true })
        : [];

    await session.commitTransaction();

    res.status(201).json({
      message: `Bulk create completed: ${createdComments.length} created, ${skippedCount} already existed`,
      created: createdComments.length,
      skipped: skippedCount,
      failed: 0,
      comments: createdComments,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// Bulk create calls using MongoDB insertMany with transaction
export const bulkCreateCalls = asyncCatch(async (req, res) => {
  const calls = req.body.operations || req.body.calls;

  if (!Array.isArray(calls) || calls.length === 0) {
    throw new AppError("Invalid calls array", 400);
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Deduplicate by idempotency key so retried offline syncs never create duplicates
    const idempotencyKeys = calls.map((c) => c.idempotencyKey).filter(Boolean);
    const alreadyProcessed = new Set();
    if (idempotencyKeys.length > 0) {
      const existing = await callModel
        .find({ idempotencyKey: { $in: idempotencyKeys } })
        .select("idempotencyKey")
        .lean()
        .session(session);
      existing.forEach((e) => alreadyProcessed.add(e.idempotencyKey));
    }
    const newCalls = calls.filter(
      (c) => !c.idempotencyKey || !alreadyProcessed.has(c.idempotencyKey),
    );
    const skippedCount = calls.length - newCalls.length;

    const createdCalls =
      newCalls.length > 0
        ? await callModel.insertMany(newCalls, { session, ordered: true })
        : [];

    await session.commitTransaction();

    res.status(201).json({
      message: `Bulk create completed: ${createdCalls.length} created, ${skippedCount} already existed`,
      created: createdCalls.length,
      skipped: skippedCount,
      failed: 0,
      calls: createdCalls,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// Bulk create organizations using MongoDB insertMany with transaction
export const bulkCreateOrganizations = asyncCatch(async (req, res) => {
  const organizations = req.body.operations || req.body.organizations;

  if (!Array.isArray(organizations) || organizations.length === 0) {
    throw new AppError("Invalid organizations array", 400);
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const organizationData = organizations.map((org) => ({
      ...org,
      userId: org.userId || req.user.userId,
      tenantId: org.tenantId || req.user.tenantId,
    }));

    // Deduplicate by idempotency key so retried offline syncs never create duplicates
    const idempotencyKeys = organizationData
      .map((o) => o.idempotencyKey)
      .filter(Boolean);
    const alreadyProcessed = new Set();
    if (idempotencyKeys.length > 0) {
      const existing = await organizationModel
        .find({ idempotencyKey: { $in: idempotencyKeys } })
        .select("idempotencyKey")
        .lean()
        .session(session);
      existing.forEach((e) => alreadyProcessed.add(e.idempotencyKey));
    }
    const newOrganizations = organizationData.filter(
      (o) => !o.idempotencyKey || !alreadyProcessed.has(o.idempotencyKey),
    );
    const skippedCount = organizationData.length - newOrganizations.length;

    const createdOrganizations =
      newOrganizations.length > 0
        ? await organizationModel.insertMany(newOrganizations, {
            session,
            ordered: true,
          })
        : [];

    await session.commitTransaction();

    res.status(201).json({
      message: `Bulk create completed: ${createdOrganizations.length} created, ${skippedCount} already existed`,
      created: createdOrganizations.length,
      skipped: skippedCount,
      failed: 0,
      organizations: createdOrganizations,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// Bulk update organizations using MongoDB bulkWrite with transaction
export const bulkUpdateOrganizations = asyncCatch(async (req, res) => {
  const updates = req.body.operations || req.body.updates;

  if (!Array.isArray(updates) || updates.length === 0) {
    throw new AppError("Invalid updates array", 400);
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
    throw error;
  } finally {
    session.endSession();
  }
});
