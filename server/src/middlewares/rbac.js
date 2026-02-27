import Role from "../models/roleModel.js";
import rolePermissionCache from "../config/cache.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";

const ROLE_NAMES = new Set(["user", "admin", "super_admin"]);

export const authorize = (...args) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const { roleId, role: legacyRole } = req.user;

      // Super admin always passes
      if (legacyRole === "super_admin") {
        return next();
      }

      // If every argument is a role name, do a role-based check (legacy path)
      // e.g. authorize("user", "admin", "super_admin")
      if (args.every((a) => ROLE_NAMES.has(a))) {
        if (!args.includes(legacyRole)) {
          throw new AppError(
            `Access denied. Required roles: ${args.join(", ")}`,
            403,
          );
        }
        return next();
      }

      // Otherwise treat args as permission strings — use dynamic RBAC
      if (!roleId) {
        throw new AppError("User role not assigned", 403);
      }

      const cacheKey = `role:${roleId}`;
      let roleDoc = rolePermissionCache.get(cacheKey);

      if (!roleDoc) {
        roleDoc = await Role.findById(roleId).lean();

        if (!roleDoc) {
          throw new AppError("Role not found", 403);
        }

        if (!roleDoc.isActive) {
          throw new AppError("Role is inactive", 403);
        }

        rolePermissionCache.set(cacheKey, roleDoc, 300000);
      }

      const userPermissions = roleDoc.permissions || [];
      const missingPermissions = args.filter(
        (perm) => !userPermissions.includes(perm),
      );

      if (missingPermissions.length > 0) {
        throw new AppError(
          `Missing permissions: ${missingPermissions.join(", ")}`,
          403,
        );
      }

      req.role = roleDoc;
      req.permissions = userPermissions;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const authorizeLegacy = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const { role } = req.user;

      if (!allowedRoles.includes(role)) {
        throw new AppError(
          `Access denied. Required roles: ${allowedRoles.join(", ")}`,
          403,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const injectTenantFilter = (req, res, next) => {
  if (req.user && req.user.role !== "super_admin") {
    const rawId = req.user.tenantId;
    const tenantId =
      rawId && mongoose.Types.ObjectId.isValid(rawId)
        ? new mongoose.Types.ObjectId(rawId)
        : rawId;
    req.tenantFilter = { tenantId };
  } else {
    req.tenantFilter = {};
  }
  next();
};

export const invalidateRoleCache = (roleId) => {
  rolePermissionCache.delete(`role:${roleId}`);
};

export const clearAllRoleCache = () => {
  rolePermissionCache.clear();
};
