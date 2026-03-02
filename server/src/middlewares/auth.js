import Role from "../models/roleModel.js";
import rolePermissionCache from "../config/cache.js";
import passport from "../config/passport.js";
import AppError from "../utils/AppError.js";
import { requestStore } from "../utils/requestContext.js";

export const authenticateRequest = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, async (err, user, info) => {
    if (err) return next(err);
    if (!user) return next(new AppError("Unauthorized", 401));

    try {
      const { userId, role, roleId, tenantId } = user;

      let permissions = [];
      if (roleId) {
        const cacheKey = `role:${roleId}`;
        let roleDoc = rolePermissionCache.get(cacheKey);

        if (!roleDoc) {
          roleDoc = await Role.findById(roleId).lean();
          if (roleDoc && roleDoc.isActive) {
            rolePermissionCache.set(cacheKey, roleDoc, 300000);
          }
        }

        if (roleDoc && roleDoc.isActive) {
          permissions = roleDoc.permissions || [];
        }
      }

      req.auth = {
        userId,
        role,
        roleId,
        tenantId,
        permissions,
      };

      req.user = req.auth;

      const store = requestStore.getStore();
      if (store) {
        store.userId = userId?.toString();
        store.tenantId = tenantId?.toString();
        store.role = role;
      }

      next();
    } catch (error) {
      next(error);
    }
  })(req, res, next);
};

export const checkActive = async (req, res, next) => {
  try {
    const { default: userModel } = await import("../models/userModel.js");
    const userDoc = await userModel.findById(req.auth.userId).lean();

    if (!userDoc || !userDoc.isActive) {
      return res.status(403).json({
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    if (!req.auth.permissions.includes("system:manage") && req.auth.tenantId) {
      const { default: tenantModel } = await import("../models/tenantModel.js");
      const tenant = await tenantModel.findById(req.auth.tenantId).lean();

      if (!tenant || !tenant.isActive) {
        return res.status(403).json({
          message:
            "Your organization account has been deactivated. Please contact support.",
        });
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};
