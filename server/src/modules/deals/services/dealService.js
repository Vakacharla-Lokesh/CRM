import dealModel from "../models/dealModel.js";
import leadModel from "../../leads/models/leadModel.js";
import mongoose from "mongoose";
import AppError from "../../../utils/appError.js";
import { wrapServiceFn } from "../../../utils/serviceWrapper.js";

export const getAllDeals = wrapServiceFn(
  async (filter, { limit = 20, cursor } = {}) => {
    if (cursor) {
      const lastId = Buffer.from(cursor, "base64").toString("utf8");
      filter._id = { $gt: lastId };
    }

    const deals = await dealModel
      .find(filter)
      .sort({ updatedAt: -1 })
      .limit(limit + 1);

    const hasNextPage = deals.length > limit;
    if (hasNextPage) deals.pop();

    const nextCursor =
      hasNextPage && deals.length > 0
        ? Buffer.from(deals[deals.length - 1]._id.toString()).toString("base64")
        : null;

    return { deals, nextCursor, hasNextPage };
  },
);

export const getDealById = wrapServiceFn(
  async (id, tenantId, userId, canViewAll) => {
    const deal = await dealModel.findById(id);
    if (!deal) throw new AppError("Deal not found", 404);

    if (tenantId && deal.tenantId.toString() !== tenantId.toString()) {
      throw new AppError("Forbidden: You cannot access this deal", 403);
    }

    if (!canViewAll && deal.assignedTo?.toString() !== userId.toString()) {
      throw new AppError("Forbidden: You cannot access this deal", 403);
    }

    return deal;
  },
);

export const createDeal = wrapServiceFn(async (dealData) => {
  return dealModel.create(dealData);
});

export const updateDeal = wrapServiceFn(
  async (id, tenantId, userId, canViewAll, updates, lastKnownUpdatedAt) => {
    const deal = await dealModel.findById(id);
    if (!deal) throw new AppError("Deal not found", 404);

    if (tenantId && deal.tenantId.toString() !== tenantId.toString()) {
      throw new AppError("Forbidden: You cannot update this deal", 403);
    }

    if (!canViewAll && deal.assignedTo?.toString() !== userId.toString()) {
      throw new AppError("Forbidden: You cannot update this deal", 403);
    }

    if (lastKnownUpdatedAt) {
      const clientTimestamp = new Date(lastKnownUpdatedAt).getTime();
      const serverTimestamp = new Date(deal.updatedAt).getTime();

      if (clientTimestamp !== serverTimestamp) {
        throw new AppError(
          "This deal was modified by someone else. Please refresh and try again.",
          409,
        );
      }
    }

    return dealModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
  },
);

export const deleteDeal = wrapServiceFn(
  async (id, tenantId, userId, canViewAll) => {
    const session = await mongoose.startSession();
    let deal;
    try {
      session.startTransaction();

      deal = await dealModel.findById(id).session(session);
      if (!deal) throw new AppError("Deal not found", 404);

      if (tenantId && deal.tenantId.toString() !== tenantId.toString()) {
        throw new AppError("Forbidden: You cannot delete this deal", 403);
      }

      if (!canViewAll && deal.assignedTo?.toString() !== userId.toString()) {
        throw new AppError("Forbidden: You cannot delete this deal", 403);
      }

      await dealModel.findByIdAndDelete(id, { session });

      // Update related lead status to 'Dead'
      if (deal.leadId) {
        await leadModel.findByIdAndUpdate(
          deal.leadId,
          { status: "Dead" },
          { session },
        );
      }

      await session.commitTransaction();
      return deal;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  },
);

export const getDealsByTenant = wrapServiceFn(async (tenantId) => {
  return dealModel.find({ tenantId });
});

export const getDealsByUser = wrapServiceFn(async (userId, tenantId) => {
  const filter = { assignedTo: userId };
  if (tenantId) filter.tenantId = tenantId;
  return dealModel.find(filter);
});

export const getDealsByLead = wrapServiceFn(async (leadId, tenantId) => {
  const filter = { leadId };
  if (tenantId) filter.tenantId = tenantId;
  return dealModel.find(filter);
});

export const getDealsByOrganization = wrapServiceFn(
  async (organizationId, tenantId) => {
    const filter = { organizationId };
    if (tenantId) filter.tenantId = tenantId;
    return dealModel.find(filter);
  },
);

export const searchDeals = wrapServiceFn(async (filter, { q, limit = 25 }) => {
  if (!q || q.trim() === "") {
    throw new AppError("Search query 'q' is required", 400);
  }

  const searchRegex = new RegExp(q.trim(), "i");
  filter.$or = [{ name: searchRegex }];

  return dealModel
    .find(filter)
    .sort({ updatedAt: -1 })
    .limit(Math.min(parseInt(limit), 25));
});

export const updateDealStatus = wrapServiceFn(
  async (id, tenantId, status, lastKnownUpdatedAt) => {
    const deal = await dealModel.findById(id);
    if (!deal) throw new AppError("Deal not found", 404);

    if (tenantId && deal.tenantId.toString() !== tenantId.toString()) {
      throw new AppError("Forbidden: You cannot update this deal", 403);
    }

    if (lastKnownUpdatedAt) {
      const clientTimestamp = new Date(lastKnownUpdatedAt).getTime();
      const serverTimestamp = new Date(deal.updatedAt).getTime();
      if (clientTimestamp !== serverTimestamp) {
        throw new AppError(
          "This deal was modified by someone else. Please refresh and try again.",
          409,
        );
      }
    }

    deal.status = status;
    await deal.save();
    return deal;
  },
);
