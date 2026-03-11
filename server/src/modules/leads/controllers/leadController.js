import mongoose from "mongoose";
import asyncCatch from "../../../utils/asyncCatch.js";
import AppError from "../../../utils/appError.js";
import * as leadService from "../services/leadService.js";
import { fireWorkflowTrigger } from "../../../middlewares/workflowTrigger.js";
import { logActivity } from "../services/leadActivityService.js";
import { LEAD_ACTIVITY_TYPES } from "../../../utils/leadActivityTypes.js";
import { bulkDeleteLeads } from "../../../services/bulkDeleteService.js";
import notificationService, {
  notificationTypes,
} from "../../../services/notificationService.js";

export const getAllLeads = asyncCatch(async (req, res) => {
  const canViewAll =
    req.auth?.role === "super_admin" ||
    (Array.isArray(req.auth?.permissions) &&
      req.auth.permissions.includes("leads:view_all"));

  const filter =
    req.tenantContext?.scope === "tenant"
      ? { tenantId: req.tenantContext.tenantId }
      : {};

  if (!canViewAll) {
    filter.assignedTo = req.auth.userId;
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.source) {
    filter.source = req.query.source;
  }
  if (req.query.pipelineId) {
    filter.pipelineId = new mongoose.Types.ObjectId(req.query.pipelineId);
  }

  const limit = parseInt(req.query.limit) || 20;
  const cursor = req.query.cursor;

  const { leads, nextCursor, hasNextPage } = await leadService.getAllLeads(
    filter,
    { limit, cursor },
  );

  res.json({
    count: leads.length,
    leads,
    nextCursor,
    hasNextPage,
  });
});

export const getLeadById = asyncCatch(async (req, res) => {
  const tenantId =
    req.tenantContext?.scope === "tenant" ? req.tenantContext.tenantId : null;

  const lead = await leadService.getLeadById(req.params.id, tenantId);

  res.json({ lead });
});

export const createLead = asyncCatch(async (req, res) => {
  const leadData = {
    ...req.body,
    createdBy: req.user.userId,
    assignedTo: req.body.assignedTo || req.user.userId,
  };

  if (req.tenantContext?.scope === "tenant") {
    leadData.tenantId = req.tenantContext.tenantId;
  }

  const lead = await leadService.createLead(leadData);

  await fireWorkflowTrigger(req, "lead", "create", lead._id, lead.toObject());

  await logActivity({
    leadId: lead._id,
    tenantId: lead.tenantId,
    type: LEAD_ACTIVITY_TYPES.CREATED,
    description: `Lead "${lead.firstName} ${lead.lastName || ""}" was created`,
    userId: req.user.userId,
  });

  notificationService.notifyLeadEvent(
    lead.tenantId,
    notificationTypes.LEAD_CREATED,
    lead.toObject(),
  );

  res.status(201).json({
    message: "Lead created successfully",
    lead,
  });
});

export const updateLead = asyncCatch(async (req, res) => {
  const tenantId =
    req.tenantContext?.scope === "tenant" ? req.tenantContext.tenantId : null;

  const { lastKnownUpdatedAt, ...updates } = req.body;
  const lead = await leadService.updateLead(
    req.params.id,
    tenantId,
    updates,
    lastKnownUpdatedAt,
  );

  await fireWorkflowTrigger(req, "lead", "update", lead._id, lead.toObject());

  await logActivity({
    leadId: req.params.id,
    tenantId: lead.tenantId,
    type: LEAD_ACTIVITY_TYPES.UPDATED,
    description: `Lead "${lead.firstName} ${lead.lastName || ""}" was updated`,
    metadata: { changes: Object.keys(req.body) },
    userId: req.user.userId,
  });

  res.json({
    message: "Lead updated successfully",
    lead,
  });
});

export const deleteLead = asyncCatch(async (req, res) => {
  const tenantId =
    req.tenantContext?.scope === "tenant" ? req.tenantContext.tenantId : null;

  const lead = await leadService.deleteLead(req.params.id, tenantId);

  await fireWorkflowTrigger(req, "lead", "delete", lead._id, lead.toObject());

  res.json({ message: "Lead deleted successfully" });
});

export const getLeadsByTenant = asyncCatch(async (req, res) => {
  if (
    req.tenantContext?.scope === "tenant" &&
    req.params.tenantId !== req.tenantContext.tenantId.toString()
  ) {
    throw new AppError(
      "Forbidden: You cannot access leads from other tenants",
      403,
    );
  }

  const leads = await leadService.getLeadsByTenant(req.params.tenantId);

  res.json({ count: leads.length, leads });
});

export const getLeadsByUser = asyncCatch(async (req, res) => {
  const tenantId =
    req.tenantContext?.scope === "tenant" ? req.tenantContext.tenantId : null;

  const leads = await leadService.getLeadsByUser(req.params.userId, tenantId);

  res.json({ count: leads.length, leads });
});

export const getLeadsByOrganization = asyncCatch(async (req, res) => {
  const tenantId =
    req.tenantContext?.scope === "tenant" ? req.tenantContext.tenantId : null;

  const leads = await leadService.getLeadsByOrganization(
    req.params.organizationId,
    tenantId,
  );

  res.json({ count: leads.length, leads });
});

export const updateLeadStatus = asyncCatch(async (req, res) => {
  const { status, lastKnownUpdatedAt } = req.body;
  const tenantId =
    req.tenantContext?.scope === "tenant" ? req.tenantContext.tenantId : null;

  const { updatedLead, previousStatus } = await leadService.updateLeadStatus(
    req.params.id,
    tenantId,
    status,
    lastKnownUpdatedAt,
  );

  await fireWorkflowTrigger(
    req,
    "lead",
    "update",
    updatedLead._id,
    updatedLead.toObject(),
  );

  await logActivity({
    leadId: req.params.id,
    tenantId: updatedLead.tenantId,
    type: LEAD_ACTIVITY_TYPES.STATUS_CHANGED,
    description: `Lead status changed from "${previousStatus}" to "${status}"`,
    metadata: { from: previousStatus, to: status },
    userId: req.user.userId,
  });

  res.json({
    message: "Lead status updated successfully",
    lead: updatedLead,
  });
});

export const updateLeadScoreManually = asyncCatch(async (req, res) => {
  const { score, lastKnownUpdatedAt } = req.body;
  const tenantId =
    req.tenantContext?.scope === "tenant" ? req.tenantContext.tenantId : null;

  const lead = await leadService.updateLeadScoreManually(
    req.params.id,
    tenantId,
    score,
    lastKnownUpdatedAt,
  );

  res.json({ message: "Lead score updated successfully", lead });
});

export const convertLeadToDeal = asyncCatch(async (req, res) => {
  const tenantId =
    req.tenantContext?.scope === "tenant" ? req.tenantContext.tenantId : null;

  const { deal, lead } = await leadService.convertLeadToDeal(
    req.params.id,
    tenantId,
    req.body,
    req.auth.userId,
  );

  await fireWorkflowTrigger(req, "lead", "update", lead._id, lead.toObject());

  await logActivity({
    leadId: lead._id,
    tenantId: lead.tenantId,
    type: LEAD_ACTIVITY_TYPES.CONVERTED_TO_DEAL,
    description: `Lead "${lead.firstName} ${lead.lastName || ""}" was converted to a deal`,
    metadata: { dealId: deal._id },
    userId: req.user.userId,
  });

  res.status(201).json({
    message: "Lead converted to deal successfully",
    deal,
    lead,
  });
});

export const searchLeads = asyncCatch(async (req, res) => {
  const filter =
    req.tenantContext?.scope === "tenant"
      ? { tenantId: req.tenantContext.tenantId }
      : {};
  const { q, status, source, limit = 25 } = req.query;

  const leads = await leadService.searchLeads(filter, {
    q,
    status,
    source,
    limit,
  });

  res.json({ count: leads.length, leads });
});

export const assignLead = asyncCatch(async (req, res) => {
  const { assignedTo } = req.body;
  const tenantId =
    req.tenantContext?.scope === "tenant" ? req.tenantContext.tenantId : null;

  const { lead, previousAssignee } = await leadService.assignLead(
    req.params.id,
    tenantId,
    assignedTo,
  );

  await logActivity({
    leadId: lead._id,
    tenantId: lead.tenantId,
    type: LEAD_ACTIVITY_TYPES.ASSIGNED,
    description: `Lead "${lead.firstName} ${lead.lastName || ""}" assigned to user ${assignedTo}`,
    metadata: { from: previousAssignee, to: assignedTo },
    userId: req.user.userId,
  });

  notificationService.notifyUser(assignedTo, {
    type: notificationTypes.LEAD_ASSIGNED,
    title: "Lead Assigned to You",
    message: `You have been assigned lead: ${lead.firstName} ${lead.lastName || ""}`,
    metadata: {
      leadId: lead._id.toString(),
      leadName: `${lead.firstName} ${lead.lastName || ""}`,
      assignedBy: req.user.userId,
      action: "lead:assigned",
    },
  });

  res.json({
    message: "Lead assigned successfully",
    lead,
  });
});
