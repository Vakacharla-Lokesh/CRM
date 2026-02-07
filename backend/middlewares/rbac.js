export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden: You do not have permission to access this resource",
      });
    }

    next();
  };
};

// Middleware to ensure user can only access their own tenant's data
export const validateTenantAccess = (req, res, next) => {
  const tenantId = req.body.tenantId || req.params.tenantId || req.query.tenantId;

  // Super admin can access all tenants
  if (req.user.role === "super_admin") {
    return next();
  }

  // Check if tenant ID matches user's tenant
  if (tenantId && tenantId !== req.user.tenantId) {
    return res.status(403).json({
      message: "Forbidden: You cannot access data from other tenants",
    });
  }

  next();
};

// Middleware to automatically filter by tenant for non-super_admin users
export const injectTenantFilter = (req, res, next) => {
  if (req.user.role !== "super_admin") {
    req.tenantFilter = { tenantId: req.user.tenantId };
  } else {
    req.tenantFilter = {};
  }
  next();
};
