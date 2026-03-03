import leadModel from "../models/leadModel.js";
import { updateLeadScore } from "../utils/leadScoreUtils.js";
import asyncCatch from "../utils/asyncCatch.js";
import AppError from "../utils/appError.js";
import { fireWorkflowTrigger } from "../middlewares/workflowTrigger.js";
import { logActivity } from "../services/leadActivityService.js";
import { LEAD_ACTIVITY_TYPES } from "../utils/leadActivityTypes.js";
import { bulkDeleteLeads } from "../services/bulkDeleteService.js";
import notificationService, { notificationTypes } from "../services/notificationService.js";

export const getAllLeads = asyncCatch(async (req, res) => {
  const filter =
    req.tenantContext?.scope === "tenant"
      ? { tenantId: req.tenantContext.tenantId }
      : {};

  const limit = parseInt(req.query.limit) || 20;
  const cursor = req.query.cursor;

  // Server-side filters
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.source) {
    filter.source = req.query.source;
  }

  if (cursor) {
    const lastUpdatedAt = Buffer.from(cursor, "base64").toString("utf8");
    filter.updatedAt = { $lt: new Date(lastUpdatedAt) };
  }

  const leads = await leadModel
    .find(filter)
    .sort({ updatedAt: -1 })
    .limit(limit + 1);

  const hasNextPage = leads.length > limit;
  if (hasNextPage) leads.pop();

  const nextCursor =
    hasNextPage && leads.length > 0
      ? Buffer.from(leads[leads.length - 1].updatedAt.toISOString()).toString(
          "base64",
        )
      : null;

  res.json({
    count: leads.length,
    leads,
    nextCursor,
    hasNextPage,
  });
});

export const getLeadById = asyncCatch(async (req, res) => {
  const lead = await leadModel.findById(req.params.id);

  if (!lead) throw new AppError("Lead not found", 404);

  if (
    req.tenantContext?.scope === "tenant" &&
    lead.tenantId.toString() !== req.tenantContext.tenantId.toString()
  ) {
    throw new AppError("Forbidden: You cannot access this lead", 403);
  }

  res.json({ lead });
});

export const createLead = asyncCatch(async (req, res) => {
  const leadData = {
    ...req.body,
    userId: req.user.userId,
  };

  if (req.tenantContext?.scope === "tenant") {
    leadData.tenantId = req.tenantContext.tenantId;
  }

  const lead = await leadModel.create(leadData);

  // Calculate and update lead score
  await updateLeadScore(lead._id);

  // Fetch updated lead with score
  const updatedLead = await leadModel.findById(lead._id);

  await fireWorkflowTrigger(
    req,
    "lead",
    "create",
    updatedLead._id,
    updatedLead.toObject(),
  );

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
    updatedLead.toObject(),
  );

  res.status(201).json({
    message: "Lead created successfully",
    lead: updatedLead,
  });
});

export const updateLead = asyncCatch(async (req, res) => {
  const lead = await leadModel.findById(req.params.id);

  if (!lead) throw new AppError("Lead not found", 404);

  if (
    req.tenantContext?.scope === "tenant" &&
    lead.tenantId.toString() !== req.tenantContext.tenantId.toString()
  ) {
    throw new AppError("Forbidden: You cannot update this lead", 403);
  }

  const updatedLead = await leadModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );

  // Recalculate lead score after update
  await updateLeadScore(req.params.id);

  // Fetch updated lead with new score
  const leadWithScore = await leadModel.findById(req.params.id);

  await fireWorkflowTrigger(
    req,
    "lead",
    "update",
    leadWithScore._id,
    leadWithScore.toObject(),
  );

  await logActivity({
    leadId: req.params.id,
    tenantId: lead.tenantId,
    type: LEAD_ACTIVITY_TYPES.UPDATED,
    description: `Lead "${leadWithScore.firstName} ${leadWithScore.lastName || ""}" was updated`,
    metadata: { changes: Object.keys(req.body) },
    userId: req.user.userId,
  });

  res.json({
    message: "Lead updated successfully",
    lead: leadWithScore,
  });
});

export const deleteLead = asyncCatch(async (req, res) => {
  const lead = await leadModel.findById(req.params.id);

  if (!lead) throw new AppError("Lead not found", 404);

  if (
    req.tenantContext?.scope === "tenant" &&
    lead.tenantId.toString() !== req.tenantContext.tenantId.toString()
  ) {
    throw new AppError("Forbidden: You cannot delete this lead", 403);
  }

  await leadModel.findByIdAndDelete(req.params.id);

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

  const leads = await leadModel.find({ tenantId: req.params.tenantId });

  res.json({ count: leads.length, leads });
});

export const getLeadsByUser = asyncCatch(async (req, res) => {
  const filter = { userId: req.params.userId };

  if (req.tenantContext?.scope === "tenant") {
    filter.tenantId = req.tenantContext.tenantId;
  }

  const leads = await leadModel.find(filter);

  res.json({ count: leads.length, leads });
});

export const getLeadsByOrganization = asyncCatch(async (req, res) => {
  const filter = { organizationId: req.params.organizationId };

  if (req.tenantContext?.scope === "tenant") {
    filter.tenantId = req.tenantContext.tenantId;
  }

  const leads = await leadModel.find(filter);

  res.json({ count: leads.length, leads });
});

export const updateLeadStatus = asyncCatch(async (req, res) => {
  const { status } = req.body;
  const lead = await leadModel.findById(req.params.id);

  if (!lead) throw new AppError("Lead not found", 404);

  if (
    req.tenantContext?.scope === "tenant" &&
    lead.tenantId.toString() !== req.tenantContext.tenantId.toString()
  ) {
    throw new AppError("Forbidden: You cannot update this lead", 403);
  }

  const previousStatus = lead.status;
  lead.status = status;
  await lead.save();

  // Recalculate lead score after status change
  await updateLeadScore(req.params.id);

  // Fetch updated lead with new score
  const updatedLead = await leadModel.findById(req.params.id);

  await fireWorkflowTrigger(
    req,
    "lead",
    "update",
    updatedLead._id,
    updatedLead.toObject(),
  );

  await logActivity({
    leadId: req.params.id,
    tenantId: lead.tenantId,
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
  const { score } = req.body;
  const lead = await leadModel.findById(req.params.id);

  if (!lead) throw new AppError("Lead not found", 404);

  if (
    req.tenantContext?.scope === "tenant" &&
    lead.tenantId.toString() !== req.tenantContext.tenantId.toString()
  ) {
    throw new AppError("Forbidden: You cannot update this lead", 403);
  }

  lead.score = score;
  await lead.save();

  res.json({ message: "Lead score updated successfully", lead });
});

export const convertLeadToDeal = asyncCatch(async (req, res) => {
  const lead = await leadModel.findById(req.params.id);

  if (!lead) throw new AppError("Lead not found", 404);

  if (
    req.tenantContext?.scope === "tenant" &&
    lead.tenantId?.toString() !== req.tenantContext.tenantId?.toString()
  ) {
    throw new AppError("Forbidden: You cannot convert this lead", 403);
  }

  if (lead.status === "Converted") {
    throw new AppError("Lead has already been converted to a deal", 400);
  }

  const dealModel = (await import("../models/dealModel.js")).default;

  const dealData = {
    leadId: lead._id,
    organizationId: lead.organizationId,
    tenantId: lead.tenantId,
    userId: lead.userId,
    name: `${lead.firstName} ${lead.lastName || ""}`.trim(),
    value: req.body.value || 0,
    status: req.body.status || "Prospecting",
  };

  const deal = await dealModel.create(dealData);

  lead.status = "Converted";
  await lead.save();

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

  if (!q || q.trim() === "") {
    throw new AppError("Search query 'q' is required", 400);
  }

  const searchRegex = new RegExp(q.trim(), "i");

  filter.$or = [
    { firstName: searchRegex },
    { lastName: searchRegex },
    { email: searchRegex },
  ];

  if (status) filter.status = status;
  if (source) filter.source = source;

  const leads = await leadModel
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(Math.min(parseInt(limit), 25));

  res.json({ count: leads.length, leads });
});

export const bulkDeleteLeadsController = asyncCatch(async (req, res) => {
  const { ids } = req.body;
  const tenantId =
    req.tenantContext?.scope === "tenant" ? req.tenantContext.tenantId : null;
  const userContext = {
    userId: req.auth.userId,
    scope: req.tenantContext?.scope,
  };

  const result = await bulkDeleteLeads(ids, tenantId, userContext);

  res.json({
    message: "Bulk delete completed",
    ...result,
  });
});
