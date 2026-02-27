import mongoose from "mongoose";
import Role from "../models/roleModel.js";
import User from "../models/userModel.js";
import AppError from "../utils/AppError.js";
import { invalidateRoleCache } from "../middlewares/rbac.js";

/**
 * Validate that a role exists and belongs to the given tenant.
 * Pass null for tenantId to skip tenant check (super_admin callers).
 * Returns the Role document (not lean, so it can be mutated).
 */
export const validateRoleOwnership = async (roleId, tenantId) => {
  if (!mongoose.Types.ObjectId.isValid(roleId)) {
    throw new AppError("Invalid role ID format", 400);
  }

  const role = await Role.findById(roleId);

  if (!role) {
    throw new AppError("Role not found", 404);
  }

  if (tenantId && role.tenantId.toString() !== tenantId.toString()) {
    // Return 404 to avoid leaking cross-tenant existence
    throw new AppError("Role not found", 404);
  }

  return role;
};

/**
 * Fetch all roles for a tenant.
 * Pass null for tenantId to return all roles (super_admin use case).
 */
export const getRolesByTenant = async (tenantId) => {
  const filter = tenantId
    ? { tenantId: new mongoose.Types.ObjectId(tenantId) }
    : {};

  return Role.find(filter).select("-__v").sort({ createdAt: -1 }).lean();
};

/**
 * Fetch a single role, enforcing tenant ownership.
 */
export const getRoleById = async (roleId, tenantId) => {
  return validateRoleOwnership(roleId, tenantId);
};

/**
 * Return the permissions array for a role.
 */
export const getRolePermissions = async (roleId) => {
  if (!mongoose.Types.ObjectId.isValid(roleId)) {
    throw new AppError("Invalid role ID format", 400);
  }

  const role = await Role.findById(roleId).select("permissions").lean();

  if (!role) {
    throw new AppError("Role not found", 404);
  }

  return role.permissions || [];
};

/**
 * Create a new role for the given tenant.
 */
export const createRole = async ({ tenantId, name, description, permissions }) => {
  const existingRole = await Role.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    name: name.trim(),
  });

  if (existingRole) {
    throw new AppError(
      `Role "${name}" already exists in your organization`,
      409,
    );
  }

  return Role.create({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    name: name.trim(),
    description: description?.trim(),
    permissions,
    isActive: true,
  });
};

/**
 * Update an existing role.
 * Blocks modification of system roles (name/permissions).
 * Pass null for tenantId to skip tenant check (super_admin callers).
 */
export const updateRole = async (roleId, tenantId, updates) => {
  const role = await validateRoleOwnership(roleId, tenantId);

  if (role.isSystemRole) {
    throw new AppError(
      "System roles cannot be modified",
      403,
    );
  }

  const { name, description, permissions, isActive } = updates;

  // Check name collision if name is being changed
  if (name && name.trim() !== role.name) {
    const existingRole = await Role.findOne({
      tenantId: role.tenantId,
      name: name.trim(),
      _id: { $ne: roleId },
    });

    if (existingRole) {
      throw new AppError(
        `Role "${name}" already exists in your organization`,
        409,
      );
    }
  }

  if (name) role.name = name.trim();
  if (description !== undefined) role.description = description.trim();
  if (permissions) role.permissions = permissions;
  if (isActive !== undefined) role.isActive = isActive;

  await role.save();

  // Invalidate permission cache so next request reloads from DB
  invalidateRoleCache(roleId);

  return role;
};

/**
 * Soft-delete a role (sets isActive = false).
 * Blocks deletion of system roles.
 * Blocks deletion if any users are still assigned to this role.
 * Pass null for tenantId to skip tenant check (super_admin callers).
 */
export const deleteRole = async (roleId, tenantId) => {
  const role = await validateRoleOwnership(roleId, tenantId);

  if (role.isSystemRole) {
    throw new AppError("System roles cannot be deleted", 403);
  }

  const usersWithRole = await User.countDocuments({ roleId });

  if (usersWithRole > 0) {
    throw new AppError(
      `Cannot delete role. ${usersWithRole} user(s) are currently assigned to this role. Please reassign them first.`,
      400,
    );
  }

  role.isActive = false;
  await role.save();

  invalidateRoleCache(roleId);
};
