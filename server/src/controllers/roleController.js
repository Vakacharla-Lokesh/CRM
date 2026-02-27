import Role from "../models/roleModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

/**
 * Get all roles for the authenticated user's tenant
 * @route GET /api/roles
 * @access Private (admin, super_admin)
 */
export const getAllRoles = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;

    // Super admin can see all roles if no tenant filter provided
    const filter =
      req.user.role === "super_admin" && !tenantId
        ? {}
        : { tenantId: new mongoose.Types.ObjectId(tenantId) };

    const roles = await Role.find(filter)
      .select("-__v")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: roles.length,
      data: roles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single role by ID
 * @route GET /api/roles/:id
 * @access Private (admin, super_admin)
 */
export const getRoleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role ID format",
      });
    }

    const role = await Role.findById(id).select("-__v").lean();

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Check tenant access (super_admin can access all)
    if (
      req.user.role !== "super_admin" &&
      role.tenantId.toString() !== req.user.tenantId
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this role",
      });
    }

    res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new role
 * @route POST /api/roles
 * @access Private (admin, super_admin)
 */
export const createRole = async (req, res, next) => {
  try {
    const { name, description, permissions } = req.body;
    const tenantId = req.user.tenantId;

    // Check if role name already exists for this tenant
    const existingRole = await Role.findOne({
      tenantId: new mongoose.Types.ObjectId(tenantId),
      name: name.trim(),
    });

    if (existingRole) {
      return res.status(409).json({
        success: false,
        message: `Role "${name}" already exists in your organization`,
      });
    }

    // Create new role
    const role = await Role.create({
      tenantId: new mongoose.Types.ObjectId(tenantId),
      name: name.trim(),
      description: description?.trim(),
      permissions,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing role
 * @route PUT /api/roles/:id
 * @access Private (admin, super_admin)
 */
export const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, permissions, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role ID format",
      });
    }

    const role = await Role.findById(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Check tenant access
    if (
      req.user.role !== "super_admin" &&
      role.tenantId.toString() !== req.user.tenantId
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this role",
      });
    }

    // Check if new name conflicts with existing role (if name is being changed)
    if (name && name.trim() !== role.name) {
      const existingRole = await Role.findOne({
        tenantId: role.tenantId,
        name: name.trim(),
        _id: { $ne: id },
      });

      if (existingRole) {
        return res.status(409).json({
          success: false,
          message: `Role "${name}" already exists in your organization`,
        });
      }
    }

    // Update fields
    if (name) role.name = name.trim();
    if (description !== undefined) role.description = description.trim();
    if (permissions) role.permissions = permissions;
    if (isActive !== undefined) role.isActive = isActive;

    await role.save();

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a role (soft delete by setting isActive = false)
 * @route DELETE /api/roles/:id
 * @access Private (super_admin only)
 */
export const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role ID format",
      });
    }

    const role = await Role.findById(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Check tenant access
    if (
      req.user.role !== "super_admin" &&
      role.tenantId.toString() !== req.user.tenantId
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this role",
      });
    }

    // Check if any users are assigned this role
    const usersWithRole = await User.countDocuments({ roleId: id });

    if (usersWithRole > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role. ${usersWithRole} user(s) are currently assigned to this role. Please reassign them first.`,
      });
    }

    // Soft delete
    role.isActive = false;
    await role.save();

    res.status(200).json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get permissions for a specific role
 * @route GET /api/roles/:id/permissions
 * @access Private (authenticated users)
 */
export const getRolePermissions = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role ID format",
      });
    }

    const role = await Role.findById(id).select("permissions").lean();

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        permissions: role.permissions || [],
      },
    });
  } catch (error) {
    next(error);
  }
};
