import organizationModel from "../models/organizationModel.js";

export const getAllOrganizations = async (req, res, next) => {
  try {
    const filter = req.tenantFilter || {};
    const limit = parseInt(req.query.limit) || 20;
    const cursor = req.query.cursor;

    if (cursor) {
      const lastId = Buffer.from(cursor, "base64").toString("utf8");
      filter._id = { $gt: lastId };
    }

    const organizations = await organizationModel
      .find(filter)
      .sort({ _id: 1 })
      .limit(limit + 1);

    const hasNextPage = organizations.length > limit;
    if (hasNextPage) organizations.pop();

    const nextCursor =
      hasNextPage && organizations.length > 0
        ? Buffer.from(
            organizations[organizations.length - 1]._id.toString(),
          ).toString("base64")
        : null;

    res.json({
      count: organizations.length,
      organizations,
      nextCursor,
      hasNextPage,
    });
  } catch (err) {
    next(err);
  }
};

export const getOrganizationById = async (req, res, next) => {
  try {
    const organization = await organizationModel.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    if (
      req.user.role !== "super_admin" &&
      organization.tenantId.toString() !== req.user.tenantId
    ) {
      return res.status(403).json({
        message: "Forbidden: You cannot access this organization",
      });
    }

    res.json({ organization });
  } catch (err) {
    next(err);
  }
};

export const createOrganization = async (req, res, next) => {
  try {
    const organizationData = {
      ...req.body,
      userId: req.user.userId,
    };

    if (!organizationData.tenantId) {
      organizationData.tenantId = req.user.tenantId;
    } else if (req.user.role !== "super_admin") {
      organizationData.tenantId = req.user.tenantId;
    }

    const organization = await organizationModel.create(organizationData);

    res.status(201).json({
      message: "Organization created successfully",
      organization,
    });
  } catch (err) {
    next(err);
  }
};

// Update organization
export const updateOrganization = async (req, res, next) => {
  try {
    const organization = await organizationModel.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Check tenant access for non-super_admin
    if (
      req.user.role !== "super_admin" &&
      organization.tenantId.toString() !== req.user.tenantId
    ) {
      return res.status(403).json({
        message: "Forbidden: You cannot update this organization",
      });
    }

    // Update organization
    const updatedOrganization = await organizationModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    res.json({
      message: "Organization updated successfully",
      organization: updatedOrganization,
    });
  } catch (err) {
    next(err);
  }
};

// Delete organization
export const deleteOrganization = async (req, res, next) => {
  try {
    const organization = await organizationModel.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Check tenant access for non-super_admin
    if (
      req.user.role !== "super_admin" &&
      organization.tenantId.toString() !== req.user.tenantId
    ) {
      return res.status(403).json({
        message: "Forbidden: You cannot delete this organization",
      });
    }

    await organizationModel.findByIdAndDelete(req.params.id);

    res.json({ message: "Organization deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Get organizations by tenant
export const getOrganizationsByTenant = async (req, res, next) => {
  try {
    // Check tenant access
    if (
      req.user.role !== "super_admin" &&
      req.params.tenantId !== req.user.tenantId
    ) {
      return res.status(403).json({
        message:
          "Forbidden: You cannot access organizations from other tenants",
      });
    }

    const organizations = await organizationModel.find({
      tenantId: req.params.tenantId,
    });

    res.json({
      count: organizations.length,
      organizations,
    });
  } catch (err) {
    next(err);
  }
};

// Get organizations by user
export const getOrganizationsByUser = async (req, res, next) => {
  try {
    const filter = { userId: req.params.userId };

    // Add tenant filter for non-super_admin
    if (req.user.role !== "super_admin") {
      filter.tenantId = req.user.tenantId;
    }

    const organizations = await organizationModel.find(filter);

    res.json({
      count: organizations.length,
      organizations,
    });
  } catch (err) {
    next(err);
  }
};
