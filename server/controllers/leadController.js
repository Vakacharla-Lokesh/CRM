import leadModel from "../models/leadModel.js";
import { updateLeadScore } from "../utils/leadScoreUtils.js";
import asyncCatch from "../utils/asyncCatch.js";
import AppError from "../utils/AppError.js";

export const getAllLeads = asyncCatch(async (req, res) => {
  const filter = req.tenantFilter || {};

  const limit = parseInt(req.query.limit) || 20;
  const cursor = req.query.cursor;

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
      ? Buffer.from(leads[leads.length - 1].updatedAt.toISOString()).toString("base64")
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
    req.user.role !== "super_admin" &&
    lead.tenantId.toString() !== req.user.tenantId
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

  if (req.user.role !== "super_admin") {
    leadData.tenantId = req.user.tenantId;
  }

  const lead = await leadModel.create(leadData);

  // Calculate and update lead score
  await updateLeadScore(lead._id);

  // Fetch updated lead with score
  const updatedLead = await leadModel.findById(lead._id);

  res.status(201).json({
    message: "Lead created successfully",
    lead: updatedLead,
  });
});

export const updateLead = asyncCatch(async (req, res) => {
  const lead = await leadModel.findById(req.params.id);

  if (!lead) throw new AppError("Lead not found", 404);

  if (
    req.user.role !== "super_admin" &&
    lead.tenantId.toString() !== req.user.tenantId.toString()
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

  res.json({
    message: "Lead updated successfully",
    lead: leadWithScore,
  });
});

export const deleteLead = asyncCatch(async (req, res) => {
  const lead = await leadModel.findById(req.params.id);

  if (!lead) throw new AppError("Lead not found", 404);

  if (
    req.user.role !== "super_admin" &&
    lead.tenantId.toString() !== req.user.tenantId
  ) {
    throw new AppError("Forbidden: You cannot delete this lead", 403);
  }

  await leadModel.findByIdAndDelete(req.params.id);

  res.json({ message: "Lead deleted successfully" });
});

export const getLeadsByTenant = asyncCatch(async (req, res) => {
  if (req.user.role !== "super_admin") {
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

  if (req.user.role !== "super_admin") {
    filter.tenantId = req.user.tenantId;
  }

  const leads = await leadModel.find(filter);

  res.json({ count: leads.length, leads });
});

export const getLeadsByOrganization = asyncCatch(async (req, res) => {
  const filter = { organizationId: req.params.organizationId };

  if (req.user.role !== "super_admin") {
    filter.tenantId = req.user.tenantId;
  }

  const leads = await leadModel.find(filter);

  res.json({ count: leads.length, leads });
});

export const updateLeadStatus = asyncCatch(async (req, res) => {
  const { leadStatus } = req.body;
  const lead = await leadModel.findById(req.params.id);

  if (!lead) throw new AppError("Lead not found", 404);

  if (
    req.user.role !== "super_admin" &&
    lead.tenantId.toString() !== req.user.tenantId
  ) {
    throw new AppError("Forbidden: You cannot update this lead", 403);
  }

  lead.leadStatus = leadStatus;
  await lead.save();

  // Recalculate lead score after status change
  await updateLeadScore(req.params.id);

  // Fetch updated lead with new score
  const updatedLead = await leadModel.findById(req.params.id);

  res.json({
    message: "Lead status updated successfully",
    lead: updatedLead,
  });
});

export const updateLeadScoreManually = asyncCatch(async (req, res) => {
  const { leadScore } = req.body;
  const lead = await leadModel.findById(req.params.id);

  if (!lead) throw new AppError("Lead not found", 404);

  if (
    req.user.role !== "super_admin" &&
    lead.tenantId.toString() !== req.user.tenantId
  ) {
    throw new AppError("Forbidden: You cannot update this lead", 403);
  }

  lead.leadScore = leadScore;
  await lead.save();

  res.json({ message: "Lead score updated successfully", lead });
});

export const convertLeadToDeal = asyncCatch(async (req, res) => {
  const lead = await leadModel.findById(req.params.id);

  if (!lead) throw new AppError("Lead not found", 404);

  if (
    req.user.role !== "super_admin" &&
    lead.tenantId?.toString() !== req.user.tenantId?.toString()
  ) {
    throw new AppError("Forbidden: You cannot convert this lead", 403);
  }

  if (lead.leadStatus === "Converted") {
    throw new AppError("Lead has already been converted to a deal", 400);
  }

  const dealModel = (await import("../models/dealModel.js")).default;

  const dealData = {
    leadId: lead._id,
    organizationId: lead.organizationId,
    tenantId: lead.tenantId,
    userId: lead.userId,
    dealName: `${lead.leadFirstName} ${lead.leadLastName || ""}`.trim(),
    dealValue: req.body.dealValue || 0,
    dealStatus: req.body.dealStatus || "Prospecting",
  };

  const deal = await dealModel.create(dealData);

  lead.leadStatus = "Converted";
  await lead.save();

  res.status(201).json({
    message: "Lead converted to deal successfully",
    deal,
    lead,
  });
});

export const searchLeads = asyncCatch(async (req, res) => {
  const filter = req.tenantFilter || {};
  const { q, status, source, limit = 25 } = req.query;

  if (!q || q.trim() === "") {
    throw new AppError("Search query 'q' is required", 400);
  }

  const searchRegex = new RegExp(q.trim(), "i");

  filter.$or = [
    { leadFirstName: searchRegex },
    { leadLastName: searchRegex },
    { leadEmail: searchRegex },
  ];

  if (status) filter.leadStatus = status;
  if (source) filter.leadSource = source;

  const leads = await leadModel
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(Math.min(parseInt(limit), 25));

  res.json({ count: leads.length, leads });
});
