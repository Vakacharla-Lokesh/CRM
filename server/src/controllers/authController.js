import jwt from "jsonwebtoken";
import crypto from "crypto";
import passport from "../config/passport.js";
import userModel from "../models/userModel.js";
import tenantModel from "../models/tenantModel.js";
import RefreshToken from "../models/refreshTokenModel.js";
import asyncCatch from "../utils/asyncCatch.js";
import AppError from "../utils/AppError.js";

import OTP from "../models/otpModel.js";
import emailController from "./emailController.js";

const OTP_EXPIRY_MINUTES = 5;
const RESET_TOKEN_EXPIRY_MINUTES = 15;
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      roleId: user.roleId,
      tenantId: user.tenantId,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );
};

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
    roleId: user.roleId?._id,
    roleName: user.roleId?.name,
    permissions: user.roleId?.permissions || [],
    tenantId: user.tenantId,
  };
}

export const register = asyncCatch(async (req, res) => {
  const { password, tenantName, ...userData } = req.body;

  const existingUser = await userModel.findOne({
    userEmail: userData.userEmail,
  });
  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
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
    throw new AppError("Tenant information is required for registration", 400);
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
});

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

export const logout = asyncCatch(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    const tokenHash = RefreshToken.hashToken(refreshToken);
    await RefreshToken.findOneAndUpdate({ tokenHash }, { revoked: true });
  }
  res.json({ message: "User logged out successfully" });
});

export const refreshToken = asyncCatch(async (req, res) => {
  const { refreshToken: rawToken } = req.body;

  if (!rawToken) throw new AppError("Refresh token is required", 401);

  const tokenHash = RefreshToken.hashToken(rawToken);
  const storedToken = await RefreshToken.findOne({ tokenHash });

  if (!storedToken) throw new AppError("Invalid refresh token", 401);

  if (storedToken.revoked) {
    await RefreshToken.updateMany(
      { userId: storedToken.userId },
      { revoked: true },
    );
    throw new AppError(
      "Refresh token reuse detected. Please log in again.",
      401,
    );
  }

  if (storedToken.expiresAt < new Date()) {
    throw new AppError("Refresh token expired", 401);
  }

  storedToken.revoked = true;
  await storedToken.save();

  const user = await userModel.findById(storedToken.userId).lean();
  if (!user) throw new AppError("User not found", 401);

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = await generateAndStoreRefreshToken(user);

  res.json({
    message: "Token refreshed successfully",
    token: newAccessToken,
    refreshToken: newRefreshToken,
  });
});

export const getProfile = asyncCatch(async (req, res) => {
  const user = await userModel.findById(req.user.userId);
  if (!user) throw new AppError("User not found", 404);
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
});

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

export const requestPasswordResetOTP = asyncCatch(async (req, res) => {
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
});

export const verifyPasswordResetOTP = asyncCatch(async (req, res) => {
  const { email, otp } = req.body;

  const otpRecord = await OTP.findOne({ email, verified: false });
  if (!otpRecord) {
    throw new AppError(
      "Invalid or expired OTP. Please request a new one.",
      400,
    );
  }

  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    await OTP.deleteOne({ _id: otpRecord._id });
    throw new AppError(
      "Too many failed attempts. Please request a new OTP.",
      429,
    );
  }

  const isValid = await otpRecord.verifyOTP(otp);
  if (!isValid) {
    otpRecord.attempts += 1;
    await otpRecord.save();

    const attemptsLeft = otpRecord.maxAttempts - otpRecord.attempts;
    throw new AppError(`Invalid OTP. ${attemptsLeft} attempts remaining.`, 400);
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
});

export const resetPassword = asyncCatch(async (req, res) => {
  const { resetToken, newPassword } = req.body;

  let decoded;
  try {
    decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
  } catch (err) {
    throw new AppError(
      "Invalid or expired reset token. Please request a new OTP.",
      400,
    );
  }

  if (decoded.type !== "password-reset") {
    throw new AppError("Invalid reset token.", 400);
  }

  const user = await userModel.findOne({ userEmail: decoded.email });
  if (!user) throw new AppError("User not found.", 404);

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
});
