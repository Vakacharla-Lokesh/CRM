import AppError from "../utils/appError.js";
import mongoose from "mongoose";

export const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    try {
      if (!req.auth) {
        throw new AppError("Authentication required", 401);
      }

      if (req.auth.role === "super_admin") {
        return next();
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

export const injectTenantContext = (req, res, next) => {
  const permissions = req.auth?.permissions || [];

  if (
    permissions.includes("system:manage") ||
    req.auth?.role === "super_admin"
  ) {
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
