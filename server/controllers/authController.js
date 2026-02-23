import jwt from "jsonwebtoken";
import crypto from "crypto";
import passport from "../config/passport.js";
import userModel from "../models/userModel.js";
import tenantModel from "../models/tenantModel.js";
import RefreshToken from "../models/refreshTokenModel.js";

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

function generateAccessToken(payload) {
  return jwt.sign(
    {
      userId: payload._id ?? payload.userId,
      role: payload.role,
      tenantId: payload.tenantId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );
}

async function generateAndStoreRefreshToken(payload) {
  const rawToken = crypto.randomBytes(64).toString("hex");
  const tokenHash = RefreshToken.hashToken(rawToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await RefreshToken.create({
    tokenHash,
    userId: payload._id ?? payload.userId,
    expiresAt,
  });

  return rawToken;
}

function formatUser(user) {
  return {
    user_id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    userEmail: user.userEmail,
    user_name: `${user.firstName} ${user.lastName || ""}`.trim(),
    mobile: user.mobile,
    role: user.role,
    tenant_id: user.tenantId,
  };
}


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
      return res
        .status(400)
        .json({ message: "Tenant information is required for registration" });
    }

    const user = await userModel.create({ ...userData, tenantId, password });

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateAndStoreRefreshToken(user);

    res.status(201).json({
      message: "User registered successfully",
      success: true,
      token: accessToken,
      refreshToken,
      user: formatUser(user),
    });
  } catch (err) {
    next(err);
  }
};

export const login = (req, res, next) => {
  passport.authenticate(
    "local",
    { session: false },
    async (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res
          .status(401)
          .json({ message: info?.message || "Invalid credentials" });
      }

      try {
        const accessToken = generateAccessToken(user);
        const refreshToken = await generateAndStoreRefreshToken(user);

        return res.json({
          message: "Login successful",
          success: true,
          token: accessToken,
          refreshToken,
          user: formatUser(user),
        });
      } catch (err) {
        return next(err);
      }
    },
  )(req, res, next);
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const tokenHash = RefreshToken.hashToken(refreshToken);
      await RefreshToken.findOneAndUpdate({ tokenHash }, { revoked: true });
    }
    res.json({ message: "User logged out successfully" });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: rawToken } = req.body;

    if (!rawToken) {
      return res.status(401).json({ message: "Refresh token is required" });
    }

    const tokenHash = RefreshToken.hashToken(rawToken);
    const storedToken = await RefreshToken.findOne({ tokenHash });

    if (!storedToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    if (storedToken.revoked) {
      await RefreshToken.updateMany(
        { userId: storedToken.userId },
        { revoked: true },
      );
      return res.status(401).json({
        message: "Refresh token reuse detected. Please log in again.",
      });
    }

    if (storedToken.expiresAt < new Date()) {
      return res.status(401).json({ message: "Refresh token expired" });
    }

    storedToken.revoked = true;
    await storedToken.save();

    const user = await userModel.findById(storedToken.userId).lean();
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = await generateAndStoreRefreshToken(user);

    res.json({
      message: "Token refreshed successfully",
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    next(err);
  }
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
