// server/controllers/leadController.js

import leadModel from "../models/leadModel.js";

// Get all leads — cursor-based pagination
export const getAllLeads = async (req, res, next) => {
  try {
    const filter = req.tenantFilter || {};

    const limit = parseInt(req.query.limit) || 20;
    const cursor = req.query.cursor; // base64-encoded _id of last item

    if (cursor) {
      // Decode the cursor (it's the _id of the last seen document)
      const lastId = Buffer.from(cursor, "base64").toString("utf8");
      filter._id = { $gt: lastId }; // fetch records AFTER this id
    }

    const leads = await leadModel
      .find(filter)
      .sort({ _id: 1 }) // consistent sort required for cursor pagination
      .limit(limit + 1); // fetch one extra to know if there's a next page

    const hasNextPage = leads.length > limit;
    if (hasNextPage) leads.pop(); // remove the extra item

    // Encode the last item's _id as the next cursor
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

// ---- All other controllers unchanged below ----

export const getLeadById = async (req, res, next) => {
  try {
    const lead = await leadModel.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (
      req.user.role !== "super_admin" &&
      lead.tenantId !== req.user.tenantId
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

    res.status(201).json({
      message: "Lead created successfully",
      lead,
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

    res.json({
      message: "Lead updated successfully",
      lead: updatedLead,
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
      lead.tenantId !== req.user.tenantId
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
      lead.tenantId !== req.user.tenantId
    ) {
      return res.status(403).json({
        message: "Forbidden: You cannot update this lead",
      });
    }

    lead.leadStatus = leadStatus;
    await lead.save();

    res.json({ message: "Lead status updated successfully", lead });
  } catch (err) {
    next(err);
  }
};

export const updateLeadScore = async (req, res, next) => {
  try {
    const { leadScore } = req.body;
    const lead = await leadModel.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (
      req.user.role !== "super_admin" &&
      lead.tenantId !== req.user.tenantId
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

// Convert lead to deal
export const convertLeadToDeal = async (req, res, next) => {
  try {
    const lead = await leadModel.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Check tenant access for non-super_admin
    if (
      req.user.role !== "super_admin" &&
      lead.tenantId?.toString() !== req.user.tenantId?.toString()
    ) {
      return res.status(403).json({
        message: "Forbidden: You cannot convert this lead",
      });
    }

    // Check if lead is already converted
    if (lead.leadStatus === "Converted") {
      return res.status(400).json({
        message: "Lead has already been converted to a deal",
      });
    }

    // Check if organizationId exists
    if (!lead.organizationId) {
      return res.status(400).json({
        message: "Lead must have an organization to convert to deal",
      });
    }

    // Import dealModel dynamically to avoid circular dependencies
    const dealModel = (await import("../models/dealModel.js")).default;

    // Create deal from lead
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

    // Update lead status to Converted
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
