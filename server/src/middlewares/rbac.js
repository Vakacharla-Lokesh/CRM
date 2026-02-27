import Role from "../models/roleModel.js";
import rolePermissionCache from "../config/cache.js";
import AppError from "../utils/AppError.js";

export const authorize = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const { roleId, role: legacyRole } = req.user;

      // Super admin bypass (legacy)
      if (legacyRole === "super_admin") {
        return next();
      }

      // Check if roleId exists
      if (!roleId) {
        throw new AppError("User role not assigned", 403);
      }

      // Try to get role from cache
      const cacheKey = `role:${roleId}`;
      let roleDoc = rolePermissionCache.get(cacheKey);

      // If not in cache, fetch from database
      if (!roleDoc) {
        roleDoc = await Role.findById(roleId).lean();

        if (!roleDoc) {
          throw new AppError("Role not found", 403);
        }

        if (!roleDoc.isActive) {
          throw new AppError("Role is inactive", 403);
        }

        // Cache for 5 minutes
        rolePermissionCache.set(cacheKey, roleDoc, 300000);
      }

      const userPermissions = roleDoc.permissions || [];

      const hasAllPermissions = requiredPermissions.every((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasAllPermissions) {
        const missingPermissions = requiredPermissions.filter(
          (perm) => !userPermissions.includes(perm),
        );

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
    req.tenantFilter = { tenantId: req.user.tenantId };
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
