import jwt from "jsonwebtoken";
import crypto from "crypto";
import passport from "../config/passport.js";
import userModel from "../models/userModel.js";
import tenantModel from "../models/tenantModel.js";
import RefreshToken from "../models/refreshTokenModel.js";

import OTP from "../models/otpModel.js";
import emailController from "./emailController.js";

const OTP_EXPIRY_MINUTES = 5;
const RESET_TOKEN_EXPIRY_MINUTES = 15;
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
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    userEmail: user.userEmail,
    mobile: user.mobile,
    role: user.role,
    tenantId: user.tenantId,
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

export const checkToken = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.json({ valid: false });
  }

  const token = authHeader.slice(7);
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ valid: true });
  } catch {
    return res.json({ valid: false });
  }
};

export const requestPasswordResetOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ userEmail: email });
    if (!user) {
      return res.json({
        message: "If an account exists, an OTP has been sent to your email",
        expiresIn: OTP_EXPIRY_MINUTES * 60,
      });
    }

    await OTP.deleteMany({ email });

    const otp = OTP.generateOTP();
    const otpHash = await OTP.hashOTP(otp);

    await OTP.create({
      email,
      otpHash,
      attempts: 0,
      verified: false,
    });

    try {
      await emailController.sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      await OTP.deleteOne({ email });
      return res.status(500).json({
        message: "Failed to send OTP. Please try again.",
      });
    }

    res.json({
      message: "OTP has been sent to your email",
      expiresIn: OTP_EXPIRY_MINUTES * 60,
    });
  } catch (err) {
    next(err);
  }
};

export const verifyPasswordResetOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email, verified: false });
    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid or expired OTP. Please request a new one.",
      });
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(429).json({
        message: "Too many failed attempts. Please request a new OTP.",
      });
    }

    const isValid = await otpRecord.verifyOTP(otp);
    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      const attemptsLeft = otpRecord.maxAttempts - otpRecord.attempts;
      return res.status(400).json({
        message: `Invalid OTP. ${attemptsLeft} attempts remaining.`,
      });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    const resetToken = jwt.sign(
      {
        email,
        type: "password-reset",
      },
      process.env.JWT_SECRET,
      { expiresIn: `${RESET_TOKEN_EXPIRY_MINUTES}m` },
    );

    res.json({
      message: "OTP verified successfully",
      resetToken,
      expiresIn: RESET_TOKEN_EXPIRY_MINUTES * 60,
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        message: "Invalid or expired reset token. Please request a new OTP.",
      });
    }

    if (decoded.type !== "password-reset") {
      return res.status(400).json({
        message: "Invalid reset token.",
      });
    }

    const user = await userModel.findOne({ userEmail: decoded.email });
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    user.password = newPassword;
    await user.save();

    await OTP.deleteOne({ email: decoded.email });

    try {
      await emailController.sendPasswordResetConfirmation(decoded.email);
    } catch (emailError) {
      console.warn("Failed to send confirmation email:", emailError);
    }

    res.json({
      message: "Password has been reset successfully. You can now log in.",
    });
  } catch (err) {
    next(err);
  }
};
