import tenantModel from "../models/tenantModel.js";

// Get all tenants
export const getAllTenants = async (req, res, next) => {
  try {
    const tenants = await tenantModel.find();

    res.json({
      count: tenants.length,
      tenants,
    });
  } catch (err) {
    next(err);
  }
};

// Get tenant by ID
export const getTenantById = async (req, res, next) => {
  try {
    const tenant = await tenantModel.findById(req.params.id);

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    res.json({ tenant });
  } catch (err) {
    next(err);
  }
};

// Create a new tenant
export const createTenant = async (req, res, next) => {
  try {
    const tenant = await tenantModel.create(req.body);

    res.status(201).json({
      message: "Tenant created successfully",
      tenant,
    });
  } catch (err) {
    next(err);
  }
};

// Update tenant
export const updateTenant = async (req, res, next) => {
  try {
    const tenant = await tenantModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    res.json({
      message: "Tenant updated successfully",
      tenant,
    });
  } catch (err) {
    next(err);
  }
};

// Delete tenant
export const deleteTenant = async (req, res, next) => {
  try {
    const tenant = await tenantModel.findByIdAndDelete(req.params.id);

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    res.json({ message: "Tenant deleted successfully" });
  } catch (err) {
    next(err);
  }
};
