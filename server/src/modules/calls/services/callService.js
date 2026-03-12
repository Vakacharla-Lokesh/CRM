import callModel from "../models/callModel.js";
import leadModel from "../../leads/models/leadModel.js";
import { updateLeadScore } from "../../../utils/leadScoreUtils.js";
import AppError from "../../../utils/appError.js";
import { wrapServiceFn } from "../../../utils/serviceWrapper.js";

export const getAllCalls = wrapServiceFn(async () => {
  return callModel.find();
});

export const getCallById = wrapServiceFn(async (id) => {
  const call = await callModel.findById(id);
  if (!call) throw new AppError("Call not found", 404);
  return call;
});

export const verifyLeadTenantAccess = wrapServiceFn(
  async (leadId, userRole, userTenantId) => {
    const lead = await leadModel.findById(leadId);
    if (!lead) throw new AppError("Lead not found", 404);

    if (
      userRole !== "super_admin" &&
      lead.tenantId.toString() !== userTenantId?.toString()
    ) {
      throw new AppError(
        "Forbidden: You cannot access resources from other tenants",
        403,
      );
    }

    return lead;
  },
);

export const createCall = wrapServiceFn(async (callData, leadId) => {
  const call = await callModel.create(callData);
  await updateLeadScore(leadId);
  return call;
});

export const updateCall = wrapServiceFn(
  async (id, updates, lastKnownUpdatedAt) => {
    const call = await callModel.findById(id);
    if (!call) throw new AppError("Call not found", 404);

    if (lastKnownUpdatedAt) {
      const clientTimestamp = new Date(lastKnownUpdatedAt).getTime();
      const serverTimestamp = new Date(call.updatedAt).getTime();

      if (clientTimestamp !== serverTimestamp) {
        throw new AppError(
          "This call was modified by someone else. Please refresh and try again.",
          409,
        );
      }
    }

    const updatedCall = await callModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    return { updatedCall, leadId: call.leadId };
  },
);

export const deleteCall = wrapServiceFn(async (id) => {
  const call = await callModel.findById(id);
  if (!call) throw new AppError("Call not found", 404);

  const leadId = call.leadId;
  await callModel.findByIdAndDelete(id);
  await updateLeadScore(leadId);

  return { call, leadId };
});

export const getCallsByLead = wrapServiceFn(async (leadId) => {
  return callModel.find({ leadId });
});
