import callModel from "../models/callModel.js";
import leadModel from "../models/leadModel.js";
import { updateLeadScore } from "../utils/leadScoreUtils.js";
import asyncCatch from "../utils/asyncCatch.js";
import AppError from "../utils/AppError.js";
import { logActivity } from "../services/leadActivityService.js";
import { LEAD_ACTIVITY_TYPES } from "../utils/leadActivityTypes.js";

// Get all calls
export const getAllCalls = asyncCatch(async (req, res) => {
  const calls = await callModel.find();

  res.json({
    count: calls.length,
    calls,
  });
});

// Get call by ID
export const getCallById = asyncCatch(async (req, res) => {
  const call = await callModel.findById(req.params.id);

  if (!call) throw new AppError("Call not found", 404);

  res.json({ call });
});

// Create a new call
export const createCall = asyncCatch(async (req, res) => {
  // Verify lead exists and belongs to user's tenant
  const lead = await leadModel.findById(req.body.leadId);

  if (!lead) throw new AppError("Lead not found", 404);

  // Check tenant access
  if (
    req.user.role !== "super_admin" &&
    lead.tenantId.toString() !== req.user.tenantId
  ) {
    throw new AppError(
      "Forbidden: You cannot add calls to leads from other tenants",
      403,
    );
  }

  const call = await callModel.create(req.body);

  // Update lead score after adding call
  await updateLeadScore(req.body.leadId);

  await logActivity({
    leadId: req.body.leadId,
    tenantId: lead.tenantId,
    type: LEAD_ACTIVITY_TYPES.CALL_ADDED,
    description: `${call.callType === "incoming" ? "Incoming" : "Outgoing"} call logged (${call.status})`,
    metadata: {
      callId: call._id,
      callType: call.callType,
      status: call.status,
      duration: call.duration,
    },
    userId: req.user.userId,
  });

  res.status(201).json({
    message: "Call created successfully",
    call,
  });
});

// Update call
export const updateCall = asyncCatch(async (req, res) => {
  const call = await callModel.findById(req.params.id);

  if (!call) throw new AppError("Call not found", 404);

  // Verify lead tenant access
  const lead = await leadModel.findById(call.leadId);
  if (
    req.user.role !== "super_admin" &&
    lead.tenantId.toString() !== req.user.tenantId
  ) {
    throw new AppError("Forbidden: You cannot update this call", 403);
  }

  const updatedCall = await callModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );

  res.json({
    message: "Call updated successfully",
    call: updatedCall,
  });
});

// Delete call
export const deleteCall = asyncCatch(async (req, res) => {
  const call = await callModel.findById(req.params.id);

  if (!call) throw new AppError("Call not found", 404);

  // Verify lead tenant access
  const lead = await leadModel.findById(call.leadId);
  if (
    req.user.role !== "super_admin" &&
    lead.tenantId.toString() !== req.user.tenantId
  ) {
    throw new AppError("Forbidden: You cannot delete this call", 403);
  }

  const leadId = call.leadId;
  await callModel.findByIdAndDelete(req.params.id);

  // Update lead score after deleting call
  await updateLeadScore(leadId);

  await logActivity({
    leadId,
    tenantId: lead.tenantId,
    type: LEAD_ACTIVITY_TYPES.CALL_DELETED,
    description: `${call.callType === "incoming" ? "Incoming" : "Outgoing"} call record was deleted`,
    metadata: { callId: req.params.id },
    userId: req.user.userId,
  });

  res.json({ message: "Call deleted successfully" });
});

// Get calls by lead
export const getCallsByLead = asyncCatch(async (req, res) => {
  // Verify lead tenant access
  const lead = await leadModel.findById(req.params.leadId);

  if (!lead) throw new AppError("Lead not found", 404);

  if (
    req.user.role !== "super_admin" &&
    lead.tenantId.toString() !== req.user.tenantId
  ) {
    throw new AppError(
      "Forbidden: You cannot access calls from other tenants",
      403,
    );
  }

  const calls = await callModel.find({ leadId: req.params.leadId });

  res.json({
    count: calls.length,
    calls,
  });
});
