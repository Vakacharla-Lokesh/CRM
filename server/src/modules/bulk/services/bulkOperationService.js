import mongoose from "mongoose";
import AppError from "../../../utils/appError.js";
import leadModel from "../../leads/models/leadModel.js";
import dealModel from "../../deals/models/dealModel.js";
import commentModel from "../../comments/models/commentModel.js";
import callModel from "../../calls/models/callModel.js";
import organizationModel from "../../organizations/models/organizationModel.js";
import { wrapServiceFn } from "../../../utils/serviceWrapper.js";

async function deduplicateByIdempotencyKey(model, items, session) {
  const idempotencyKeys = items.map((i) => i.idempotencyKey).filter(Boolean);
  const alreadyProcessed = new Set();

  if (idempotencyKeys.length > 0) {
    const existing = await model
      .find({ idempotencyKey: { $in: idempotencyKeys } })
      .select("idempotencyKey")
      .lean()
      .session(session);
    existing.forEach((e) => alreadyProcessed.add(e.idempotencyKey));
  }

  const newItems = items.filter(
    (i) => !i.idempotencyKey || !alreadyProcessed.has(i.idempotencyKey),
  );
  const skippedCount = items.length - newItems.length;

  return { newItems, skippedCount };
}

async function runInTransaction(fn) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction({
      readConcern: { level: "snapshot" },
      writeConcern: { w: "majority", j: true },
    });
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export const bulkCreateLeads = wrapServiceFn(
  async (leads, defaultUserId, defaultTenantId) => {
    if (!Array.isArray(leads) || leads.length === 0) {
      throw new AppError("Invalid leads array", 400);
    }

    return runInTransaction(async (session) => {
      const leadData = leads.map((lead) => ({
        ...lead,
        userId: lead.userId || defaultUserId,
        tenantId: lead.tenantId || defaultTenantId,
      }));

      const { newItems, skippedCount } = await deduplicateByIdempotencyKey(
        leadModel,
        leadData,
        session,
      );

      const createdLeads =
        newItems.length > 0
          ? await leadModel.insertMany(newItems, { session, ordered: true })
          : [];

      return {
        created: createdLeads.length,
        skipped: skippedCount,
        items: createdLeads,
      };
    });
  },
);

export const bulkUpdateLeads = wrapServiceFn(async (updates) => {
  if (!Array.isArray(updates) || updates.length === 0) {
    throw new AppError("Invalid updates array", 400);
  }

  return runInTransaction(async (session) => {
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

    return {
      updated: result.modifiedCount,
      matched: result.matchedCount,
      failed: updates.length - result.matchedCount,
    };
  });
});

export const bulkCreateDeals = wrapServiceFn(
  async (deals, defaultUserId, defaultTenantId) => {
    if (!Array.isArray(deals) || deals.length === 0) {
      throw new AppError("Invalid deals array", 400);
    }

    return runInTransaction(async (session) => {
      const dealData = deals.map((deal) => ({
        ...deal,
        userId: deal.userId || defaultUserId,
        tenantId: deal.tenantId || defaultTenantId,
      }));

      const { newItems, skippedCount } = await deduplicateByIdempotencyKey(
        dealModel,
        dealData,
        session,
      );

      const createdDeals =
        newItems.length > 0
          ? await dealModel.insertMany(newItems, { session, ordered: true })
          : [];

      return {
        created: createdDeals.length,
        skipped: skippedCount,
        items: createdDeals,
      };
    });
  },
);

export const bulkUpdateDeals = wrapServiceFn(async (updates) => {
  if (!Array.isArray(updates) || updates.length === 0) {
    throw new AppError("Invalid updates array", 400);
  }

  return runInTransaction(async (session) => {
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

    return {
      updated: result.modifiedCount,
      matched: result.matchedCount,
      failed: updates.length - result.matchedCount,
    };
  });
});

export const bulkCreateComments = wrapServiceFn(async (comments) => {
  if (!Array.isArray(comments) || comments.length === 0) {
    throw new AppError("Invalid comments array", 400);
  }

  return runInTransaction(async (session) => {
    const { newItems, skippedCount } = await deduplicateByIdempotencyKey(
      commentModel,
      comments,
      session,
    );

    const createdComments =
      newItems.length > 0
        ? await commentModel.insertMany(newItems, { session, ordered: true })
        : [];

    return {
      created: createdComments.length,
      skipped: skippedCount,
      items: createdComments,
    };
  });
});

export const bulkCreateCalls = wrapServiceFn(async (calls) => {
  if (!Array.isArray(calls) || calls.length === 0) {
    throw new AppError("Invalid calls array", 400);
  }

  return runInTransaction(async (session) => {
    const { newItems, skippedCount } = await deduplicateByIdempotencyKey(
      callModel,
      calls,
      session,
    );

    const createdCalls =
      newItems.length > 0
        ? await callModel.insertMany(newItems, { session, ordered: true })
        : [];

    return {
      created: createdCalls.length,
      skipped: skippedCount,
      items: createdCalls,
    };
  });
});

export const bulkCreateOrganizations = wrapServiceFn(
  async (organizations, defaultUserId, defaultTenantId) => {
    if (!Array.isArray(organizations) || organizations.length === 0) {
      throw new AppError("Invalid organizations array", 400);
    }

    return runInTransaction(async (session) => {
      const organizationData = organizations.map((org) => ({
        ...org,
        userId: org.userId || defaultUserId,
        tenantId: org.tenantId || defaultTenantId,
      }));

      const { newItems, skippedCount } = await deduplicateByIdempotencyKey(
        organizationModel,
        organizationData,
        session,
      );

      const createdOrganizations =
        newItems.length > 0
          ? await organizationModel.insertMany(newItems, {
              session,
              ordered: true,
            })
          : [];

      return {
        created: createdOrganizations.length,
        skipped: skippedCount,
        items: createdOrganizations,
      };
    });
  },
);

export const bulkUpdateOrganizations = wrapServiceFn(async (updates) => {
  if (!Array.isArray(updates) || updates.length === 0) {
    throw new AppError("Invalid updates array", 400);
  }

  return runInTransaction(async (session) => {
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

    return {
      updated: result.modifiedCount,
      matched: result.matchedCount,
      failed: updates.length - result.matchedCount,
    };
  });
});
