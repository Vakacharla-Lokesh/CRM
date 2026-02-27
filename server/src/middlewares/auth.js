import userModel from "../models/userModel.js";
import tenantModel from "../models/tenantModel.js";
import passport from "../config/passport.js";
import AppError from "../utils/AppError.js";

export const authenticate = async (req, res, next) => {
  passport.authenticate("jwt", { session: false }, async (err, user, info) => {
    if (err) return next(err);
    if (!user) return next(new AppError("Unauthorized", 401));

    req.user = user;

    if (user.roleId && typeof user.roleId === "string") {
      try {
        const Role = (await import("../models/roleModel.js")).default;
        const roleDoc = await Role.findById(user.roleId).lean();
        if (roleDoc) {
          req.userRole = roleDoc;
        }
      } catch (error) {
        console.warn("Failed to fetch role:", error);
      }
    }

    next();
  })(req, res, next);
};

export const checkActive = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.userId).lean();

    if (!user || !user.isActive) {
      return res.status(403).json({
        message: "Your account has been deactivated. Please contact support.",
      });
    }

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
