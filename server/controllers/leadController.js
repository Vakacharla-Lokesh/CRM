import leadModel from "../models/leadModel.js";
import { updateLeadScore } from "../utils/leadScoreUtils.js";

export const getAllLeads = async (req, res, next) => {
  try {
    const filter = req.tenantFilter || {};

    const limit = parseInt(req.query.limit) || 20;
    const cursor = req.query.cursor;

    if (cursor) {
      const lastId = Buffer.from(cursor, "base64").toString("utf8");
      filter._id = { $gt: lastId };
    }

    const leads = await leadModel
      .find(filter)
      .sort({ _id: 1 })
      .limit(limit + 1);

    const hasNextPage = leads.length > limit;
    if (hasNextPage) leads.pop();

    const nextCursor =
      hasNextPage && leads.length > 0
        ? Buffer.from(leads[leads.length - 1]._id.toString()).toString("base64")
        : null;

    res.json({
      count: leads.length,
      leads,
      nextCursor,
      hasNextPage,
    });
  } catch (err) {
    next(err);
  }
};

export const getLeadById = async (req, res, next) => {
  try {
    const lead = await leadModel.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (
      req.user.role !== "super_admin" &&
      lead.tenantId.toString() !== req.user.tenantId
    ) {
      return res.status(403).json({
        message: "Forbidden: You cannot access this lead",
      });
    }

    res.json({ lead });
  } catch (err) {
    next(err);
  }
};

export const createLead = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};

export const updateLead = async (req, res, next) => {
  try {
    const lead = await leadModel.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (
      req.user.role !== "super_admin" &&
      lead.tenantId.toString() !== req.user.tenantId.toString()
    ) {
      return res.status(403).json({
        message: "Forbidden: You cannot update this lead",
      });
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
  } catch (err) {
    next(err);
  }
};

export const deleteLead = async (req, res, next) => {
  try {
    const lead = await leadModel.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (
      req.user.role !== "super_admin" &&
      lead.tenantId.toString() !== req.user.tenantId
    ) {
      return res.status(403).json({
        message: "Forbidden: You cannot delete this lead",
      });
    }

    await leadModel.findByIdAndDelete(req.params.id);

    res.json({ message: "Lead deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const getLeadsByTenant = async (req, res, next) => {
  try {
    if (req.user.role !== "super_admin") {
      return res.status(403).json({
        message: "Forbidden: You cannot access leads from other tenants",
      });
    }

    const leads = await leadModel.find({ tenantId: req.params.tenantId });

    res.json({ count: leads.length, leads });
  } catch (err) {
    next(err);
  }
};

export const getLeadsByUser = async (req, res, next) => {
  try {
    const filter = { userId: req.params.userId };

    if (req.user.role !== "super_admin") {
      filter.tenantId = req.user.tenantId;
    }

    const leads = await leadModel.find(filter);

    res.json({ count: leads.length, leads });
  } catch (err) {
    next(err);
  }
};

export const getLeadsByOrganization = async (req, res, next) => {
  try {
    const filter = { organizationId: req.params.organizationId };

    if (req.user.role !== "super_admin") {
      filter.tenantId = req.user.tenantId;
    }

    const leads = await leadModel.find(filter);

    res.json({ count: leads.length, leads });
  } catch (err) {
    next(err);
  }
};

export const updateLeadStatus = async (req, res, next) => {
  try {
    const { leadStatus } = req.body;
    const lead = await leadModel.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (
      req.user.role !== "super_admin" &&
      lead.tenantId.toString() !== req.user.tenantId
    ) {
      return res.status(403).json({
        message: "Forbidden: You cannot update this lead",
      });
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
  } catch (err) {
    next(err);
  }
};

export const updateLeadScoreManually = async (req, res, next) => {
  try {
    const { leadScore } = req.body;
    const lead = await leadModel.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (
      req.user.role !== "super_admin" &&
      lead.tenantId.toString() !== req.user.tenantId
    ) {
      return res.status(403).json({
        message: "Forbidden: You cannot update this lead",
      });
    }

    lead.leadScore = leadScore;
    await lead.save();

    res.json({ message: "Lead score updated successfully", lead });
  } catch (err) {
    next(err);
  }
};

export const convertLeadToDeal = async (req, res, next) => {
  try {
    const lead = await leadModel.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (
      req.user.role !== "super_admin" &&
      lead.tenantId?.toString() !== req.user.tenantId?.toString()
    ) {
      return res.status(403).json({
        message: "Forbidden: You cannot convert this lead",
      });
    }

    if (lead.leadStatus === "Converted") {
      return res.status(400).json({
        message: "Lead has already been converted to a deal",
      });
    }

    if (!lead.organizationId) {
      return res.status(400).json({
        message: "Lead must have an organization to convert to deal",
      });
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
  } catch (err) {
    next(err);
  }
};

export const searchLeads = async (req, res, next) => {
  try {
    const filter = req.tenantFilter || {};
    const { q, status, source, limit = 25 } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Search query 'q' is required" });
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
  } catch (err) {
    next(err);
  }
};
