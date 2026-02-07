import dealModel from "../models/dealModel.js";

// Get all deals
export const getAllDeals = async (req, res, next) => {
  try {
    const filter = req.tenantFilter || {};
    const deals = await dealModel.find(filter);

    res.json({
      count: deals.length,
      deals,
    });
  } catch (err) {
    next(err);
  }
};

// Get deal by ID
export const getDealById = async (req, res, next) => {
  try {
    const deal = await dealModel.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    // Check tenant access for non-super_admin
    if (
      req.user.role !== "super_admin" &&
      deal.tenantId !== req.user.tenantId
    ) {
      return res.status(403).json({
        message: "Forbidden: You cannot access this deal",
      });
    }

    res.json({ deal });
  } catch (err) {
    next(err);
  }
};

// Create a new deal
export const createDeal = async (req, res, next) => {
  try {
    // Ensure userId from authenticated user
    const dealData = {
      ...req.body,
      userId: req.user.userId,
    };

    // For non-super_admin, ensure tenantId matches
    if (req.user.role !== "super_admin") {
      dealData.tenantId = req.user.tenantId;
    }

    const deal = await dealModel.create(dealData);

    res.status(201).json({
      message: "Deal created successfully",
      deal,
    });
  } catch (err) {
    next(err);
  }
};

// Update deal
export const updateDeal = async (req, res, next) => {
  try {
    const deal = await dealModel.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    // Check tenant access for non-super_admin
    if (
      req.user.role !== "super_admin" &&
      deal.tenantId !== req.user.tenantId
    ) {
      return res.status(403).json({
        message: "Forbidden: You cannot update this deal",
      });
    }

    // Update deal
    const updatedDeal = await dealModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    res.json({
      message: "Deal updated successfully",
      deal: updatedDeal,
    });
  } catch (err) {
    next(err);
  }
};

// Delete deal
export const deleteDeal = async (req, res, next) => {
  try {
    const deal = await dealModel.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    // Check tenant access for non-super_admin
    if (
      req.user.role !== "super_admin" &&
      deal.tenantId !== req.user.tenantId
    ) {
      return res.status(403).json({
        message: "Forbidden: You cannot delete this deal",
      });
    }

    await dealModel.findByIdAndDelete(req.params.id);

    res.json({ message: "Deal deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Get deals by tenant
export const getDealsByTenant = async (req, res, next) => {
  try {
    // Check tenant access
    if (
      req.user.role !== "super_admin" &&
      req.params.tenantId !== req.user.tenantId
    ) {
      return res.status(403).json({
        message: "Forbidden: You cannot access deals from other tenants",
      });
    }

    const deals = await dealModel.find({ tenantId: req.params.tenantId });

    res.json({
      count: deals.length,
      deals,
    });
  } catch (err) {
    next(err);
  }
};

// Get deals by user
export const getDealsByUser = async (req, res, next) => {
  try {
    const filter = { userId: req.params.userId };

    // Add tenant filter for non-super_admin
    if (req.user.role !== "super_admin") {
      filter.tenantId = req.user.tenantId;
    }

    const deals = await dealModel.find(filter);

    res.json({
      count: deals.length,
      deals,
    });
  } catch (err) {
    next(err);
  }
};

// Get deals by lead
export const getDealsByLead = async (req, res, next) => {
  try {
    const filter = { leadId: req.params.leadId };

    // Add tenant filter for non-super_admin
    if (req.user.role !== "super_admin") {
      filter.tenantId = req.user.tenantId;
    }

    const deals = await dealModel.find(filter);

    res.json({
      count: deals.length,
      deals,
    });
  } catch (err) {
    next(err);
  }
};

// Get deals by organization
export const getDealsByOrganization = async (req, res, next) => {
  try {
    const filter = { organizationId: req.params.organizationId };

    // Add tenant filter for non-super_admin
    if (req.user.role !== "super_admin") {
      filter.tenantId = req.user.tenantId;
    }

    const deals = await dealModel.find(filter);

    res.json({
      count: deals.length,
      deals,
    });
  } catch (err) {
    next(err);
  }
};

// Update deal status
export const updateDealStatus = async (req, res, next) => {
  try {
    const { dealStatus } = req.body;
    const deal = await dealModel.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    // Check tenant access for non-super_admin
    if (
      req.user.role !== "super_admin" &&
      deal.tenantId !== req.user.tenantId
    ) {
      return res.status(403).json({
        message: "Forbidden: You cannot update this deal",
      });
    }

    deal.dealStatus = dealStatus;
    await deal.save();

    res.json({
      message: "Deal status updated successfully",
      deal,
    });
  } catch (err) {
    next(err);
  }
};
