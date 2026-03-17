import passport from "../config/passport.js";
import AppError from "../utils/appError.js";
import { requestStore } from "../utils/requestContext.js";

export const authenticateRequest = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, async (err, user, info) => {
    if (err) return next(err);
    if (!user) return next(new AppError("Unauthorized", 401));

    try {
      const { userId, role, tenantId, permissions } = user;

      req.auth = { userId, role, tenantId, permissions: permissions || [] };
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
    const { default: userModel } =
      await import("../modules/users/models/userModel.js");
    const userDoc = await userModel.findById(req.auth.userId).lean();

    if (!userDoc || !userDoc.isActive) {
      return res.status(403).json({
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    if (!req.auth.permissions.includes("system:manage") && req.auth.tenantId) {
      const { default: tenantModel } =
        await import("../modules/tenants/models/tenantModel.js");
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
