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

    // Check tenant access for non-super_admin
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
    // Ensure userId from authenticated user
    const leadData = {
      ...req.body,
      userId: req.user.userId,
    };

    // For non-super_admin, ensure tenantId matches
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

    // Check tenant access for non-super_admin
    if (
      req.user.role !== "super_admin" &&
      lead.tenantId !== req.user.tenantId
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

    // Check tenant access for non-super_admin
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
    // Check tenant access
    if (
      req.user.role !== "super_admin" &&
      req.params.tenantId !== req.user.tenantId
    ) {
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

    // Add tenant filter for non-super_admin
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

    // Add tenant filter for non-super_admin
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

// Update lead status
export const updateLeadStatus = async (req, res, next) => {
  try {
    const { leadStatus } = req.body;
    const lead = await leadModel.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Check tenant access for non-super_admin
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

    // Check tenant access for non-super_admin
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
