import leadModel from "../models/leadModel.js";

// Get all leads
export const getAllLeads = async (req, res, next) => {
  try {
    const filter = req.tenantFilter || {};
    const leads = await leadModel.find(filter);

    res.json({
      count: leads.length,
      leads,
    });
  } catch (err) {
    next(err);
  }
};

// Get lead by ID
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

// Create a new lead
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

// Update lead
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

    // Update lead
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

// Delete lead
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

// Get leads by tenant
export const getLeadsByTenant = async (req, res, next) => {
  try {
    if (req.user.role !== "super_admin") {
      return res.status(403).json({
        message: "Forbidden: You cannot access leads from other tenants",
      });
    }

    const leads = await leadModel.find({ tenantId: req.params.tenantId });

    res.json({
      count: leads.length,
      leads,
    });
  } catch (err) {
    next(err);
  }
};

// Get leads by user
export const getLeadsByUser = async (req, res, next) => {
  try {
    const filter = { userId: req.params.userId };

    if (req.user.role !== "super_admin") {
      filter.tenantId = req.user.tenantId;
    }

    const leads = await leadModel.find(filter);

    res.json({
      count: leads.length,
      leads,
    });
  } catch (err) {
    next(err);
  }
};

// Get leads by organization
export const getLeadsByOrganization = async (req, res, next) => {
  try {
    const filter = { organizationId: req.params.organizationId };

    if (req.user.role !== "super_admin") {
      filter.tenantId = req.user.tenantId;
    }

    const leads = await leadModel.find(filter);

    res.json({
      count: leads.length,
      leads,
    });
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

    res.json({
      message: "Lead status updated successfully",
      lead,
    });
  } catch (err) {
    next(err);
  }
};

// Update lead score
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

    res.json({
      message: "Lead score updated successfully",
      lead,
    });
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
