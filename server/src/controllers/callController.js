import * as callService from "../services/callService.js";
import asyncCatch from "../utils/asyncCatch.js";
import { logActivity } from "../services/leadActivityService.js";
import { LEAD_ACTIVITY_TYPES } from "../utils/leadActivityTypes.js";

// Get all calls
export const getAllCalls = asyncCatch(async (req, res) => {
  const calls = await callService.getAllCalls();

  res.json({
    count: calls.length,
    calls,
  });
});

// Get call by ID
export const getCallById = asyncCatch(async (req, res) => {
  const call = await callService.getCallById(req.params.id);

  res.json({ call });
});

// Create a new call
export const createCall = asyncCatch(async (req, res) => {
  const lead = await callService.verifyLeadTenantAccess(
    req.body.leadId,
    req.user.role,
    req.user.tenantId,
  );

  const call = await callService.createCall(req.body, req.body.leadId);

  await logActivity({
    leadId: req.body.leadId,
    tenantId: lead.tenantId,
    type: LEAD_ACTIVITY_TYPES.CALL_ADDED,
    description: `${call.type === "incoming" ? "Incoming" : "Outgoing"} call logged (${call.status})`,
    metadata: {
      callId: call._id,
      type: call.type,
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
  const existing = await callService.getCallById(req.params.id);

  await callService.verifyLeadTenantAccess(
    existing.leadId,
    req.user.role,
    req.user.tenantId,
  );

  const { updatedCall } = await callService.updateCall(
    req.params.id,
    req.body,
  );

  res.json({
    message: "Call updated successfully",
    call: updatedCall,
  });
});

// Delete call
export const deleteCall = asyncCatch(async (req, res) => {
  const existing = await callService.getCallById(req.params.id);

  const lead = await callService.verifyLeadTenantAccess(
    existing.leadId,
    req.user.role,
    req.user.tenantId,
  );

  const { call, leadId } = await callService.deleteCall(req.params.id);

  await logActivity({
    leadId,
    tenantId: lead.tenantId,
    type: LEAD_ACTIVITY_TYPES.CALL_DELETED,
    description: `${call.type === "incoming" ? "Incoming" : "Outgoing"} call record was deleted`,
    metadata: { callId: req.params.id },
    userId: req.user.userId,
  });

  res.json({ message: "Call deleted successfully" });
});

// Get calls by lead
export const getCallsByLead = asyncCatch(async (req, res) => {
  await callService.verifyLeadTenantAccess(
    req.params.leadId,
    req.user.role,
    req.user.tenantId,
  );

  const calls = await callService.getCallsByLead(req.params.leadId);

  res.json({
    count: calls.length,
    calls,
  });
});
