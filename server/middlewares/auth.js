import userModel from "../models/userModel.js";
import tenantModel from "../models/tenantModel.js";

import passport from "../config/passport.js";

export const authenticate = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Internal server error", error: err.message });
    }

    if (!user) {
      return res.status(401).json({
        message: "Invalid or expired token",
        error: info?.message || "Authentication required",
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};

export const checkActive = async (req, res, next) => {
  try {
    // super_admin is platform-level, skip tenant check
    const user = await userModel.findById(req.user.userId).lean();

    if (!user || !user.isActive) {
      return res.status(403).json({
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    // Only check tenant for non-super_admin
    if (req.user.role !== "super_admin" && req.user.tenantId) {
      const tenant = await tenantModel.findById(req.user.tenantId).lean();

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
