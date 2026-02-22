import jwt from "jsonwebtoken";
import passport from "../config/passport.js";
import userModel from "../models/userModel.js";
import tenantModel from "../models/tenantModel.js";

export const register = async (req, res, next) => {
  try {
    const { password, tenantName, ...userData } = req.body;

    const existingUser = await userModel.findOne({
      userEmail: userData.userEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    let tenantId = userData.tenantId;
    if (tenantName && !tenantId) {
      const tenant = await tenantModel.create({
        tenantName,
        email: userData.userEmail,
        mobile: userData.mobile || "0000000000",
      });
      tenantId = tenant._id;
    }

    if (!tenantId) {
      return res.status(400).json({
        message: "Tenant information is required for registration",
      });
    }

    const user = await userModel.create({
      ...userData,
      tenantId,
      password,
    });

    const token = jwt.sign(
      { userId: user._id, role: user.role, tenantId: user.tenantId },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.status(201).json({
      message: "User registered successfully",
      success: true,
      token,
      user: {
        user_id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        userEmail: user.userEmail,
        user_name: `${user.firstName} ${user.lastName || ""}`.trim(),
        mobile: user.mobile,
        role: user.role,
        tenant_id: user.tenantId,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({
        message: info?.message || "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, tenantId: user.tenantId },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    return res.json({
      message: "Login successful",
      success: true,
      token,
      user: {
        user_id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        userEmail: user.userEmail,
        user_name: `${user.firstName} ${user.lastName || ""}`.trim(),
        mobile: user.mobile,
        role: user.role,
        tenant_id: user.tenantId,
      },
    });
  })(req, res, next);
};

export const logout = (req, res) => {
  res.json({ message: "User logged out successfully" });
};

export const refreshToken = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({
        message: info?.message || "Token required or invalid",
      });
    }

    const newToken = jwt.sign(
      { userId: user.userId, role: user.role, tenantId: user.tenantId },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      message: "Token refreshed successfully",
      token: newToken,
    });
  })(req, res, next);
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        userEmail: user.userEmail,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};
