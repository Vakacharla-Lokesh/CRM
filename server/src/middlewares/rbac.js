import mongoose from "mongoose";

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message:
          "Forbidden: You do not have permission to access this resource",
      });
    }

    next();
  };
};

export const validateTenantAccess = (req, res, next) => {
  const tenantId =
    req.body.tenantId || req.params.tenantId || req.query.tenantId;
  if (req.user.role === "super_admin") {
    return next();
  }

  if (tenantId && tenantId !== req.user.tenantId) {
    return res.status(403).json({
      message: "Forbidden: You cannot access data from other tenants",
    });
  }

  next();
};

export const injectTenantFilter = (req, res, next) => {
  if (req.user.role !== "super_admin") {
    req.tenantFilter = {
      tenantId: new mongoose.Types.ObjectId(req.user.tenantId),
    };
  } else {
    req.tenantFilter = {};
  }
  next();
};
