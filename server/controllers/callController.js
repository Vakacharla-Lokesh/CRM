import callModel from "../models/callModel.js";
import leadModel from "../models/leadModel.js";

// Get all calls
export const getAllCalls = async (req, res, next) => {
  try {
    const calls = await callModel.find();

    res.json({
      count: calls.length,
      calls,
    });
  } catch (err) {
    next(err);
  }
};

// Get call by ID
export const getCallById = async (req, res, next) => {
  try {
    const call = await callModel.findById(req.params.id);

    if (!call) {
      return res.status(404).json({ message: "Call not found" });
    }

    res.json({ call });
  } catch (err) {
    next(err);
  }
};

// Create a new call
export const createCall = async (req, res, next) => {
  try {
    // Verify lead exists and belongs to user's tenant
    const lead = await leadModel.findById(req.body.leadId);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Check tenant access
    if (
      req.user.role !== "super_admin" &&
      lead.tenantId !== req.user.tenantId
    ) {
      return res.status(403).json({
        message: "Forbidden: You cannot add calls to leads from other tenants",
      });
    }

    const call = await callModel.create(req.body);

    res.status(201).json({
      message: "Call created successfully",
      call,
    });
  } catch (err) {
    next(err);
  }
};

// Update call
export const updateCall = async (req, res, next) => {
  try {
    const call = await callModel.findById(req.params.id);

    if (!call) {
      return res.status(404).json({ message: "Call not found" });
    }

    // Verify lead tenant access
    const lead = await leadModel.findById(call.leadId);
    if (
      req.user.role !== "super_admin" &&
      lead.tenantId !== req.user.tenantId
    ) {
      return res.status(403).json({
        message: "Forbidden: You cannot update this call",
      });
    }

    const updatedCall = await callModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    res.json({
      message: "Call updated successfully",
      call: updatedCall,
    });
  } catch (err) {
    next(err);
  }
};

// Delete call
export const deleteCall = async (req, res, next) => {
  try {
    const call = await callModel.findById(req.params.id);

    if (!call) {
      return res.status(404).json({ message: "Call not found" });
    }

    // Verify lead tenant access
    const lead = await leadModel.findById(call.leadId);
    if (
      req.user.role !== "super_admin" &&
      lead.tenantId !== req.user.tenantId
    ) {
      return res.status(403).json({
        message: "Forbidden: You cannot delete this call",
      });
    }

    await callModel.findByIdAndDelete(req.params.id);

    res.json({ message: "Call deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Get calls by lead
export const getCallsByLead = async (req, res, next) => {
  try {
    // Verify lead tenant access
    const lead = await leadModel.findById(req.params.leadId);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (
      req.user.role !== "super_admin" &&
      lead.tenantId !== req.user.tenantId
    ) {
      return res.status(403).json({
        message: "Forbidden: You cannot access calls from other tenants",
      });
    }

    const calls = await callModel.find({ leadId: req.params.leadId });

    res.json({
      count: calls.length,
      calls,
    });
  } catch (err) {
    next(err);
  }
};
