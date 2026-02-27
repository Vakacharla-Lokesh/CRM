import rolePermissionCache from "../config/cache.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";

/**
 * Permission-only authorization middleware.
 *
 * Accepts one or more permission strings (e.g. "leads:read", "tenants:write").
 * Checks req.auth.permissions — never inspects role names.
 *
 * Must run AFTER authenticateRequest.
 */
export const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    try {
      if (!req.auth) {
        throw new AppError("Authentication required", 401);
      }

      const userPermissions = req.auth.permissions || [];
      const missingPermissions = requiredPermissions.filter(
        (perm) => !userPermissions.includes(perm),
      );

      if (missingPermissions.length > 0) {
        throw new AppError(
          `Missing permissions: ${missingPermissions.join(", ")}`,
          403,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Tenant context middleware.
 *
 * Sets req.tenantContext based on permissions:
 *  - system:manage permission → { scope: 'global' }
 *  - otherwise → { scope: 'tenant', tenantId }
 *
 * Also sets req.tenantFilter for backward compatibility with controllers.
 *
 * Must run AFTER authenticateRequest.
 */
export const injectTenantContext = (req, res, next) => {
  const permissions = req.auth?.permissions || [];

  if (permissions.includes("system:manage")) {
    req.tenantContext = { scope: "global" };
    req.tenantFilter = {};
  } else {
    const rawId = req.auth?.tenantId;
    const tenantId =
      rawId && mongoose.Types.ObjectId.isValid(rawId)
        ? new mongoose.Types.ObjectId(rawId)
        : rawId;

    req.tenantContext = { scope: "tenant", tenantId };
    req.tenantFilter = { tenantId };
  }

  next();
};

export const invalidateRoleCache = (roleId) => {
  rolePermissionCache.delete(`role:${roleId}`);
};

export const clearAllRoleCache = () => {
  rolePermissionCache.clear();
};
