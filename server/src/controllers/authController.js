import jwt from "jsonwebtoken";
import crypto from "crypto";
import passport from "../config/passport.js";
import userModel from "../models/userModel.js";
import tenantModel from "../models/tenantModel.js";
import RefreshToken from "../models/refreshTokenModel.js";
import asyncCatch from "../utils/asyncCatch.js";
import AppError from "../utils/appError.js";
import { otpCache } from "../config/cache.js";
import emailController from "./emailController.js";

const OTP_EXPIRY_MINUTES = 5;
const RESET_TOKEN_EXPIRY_MINUTES = 15;
const AUTH_TOKEN_EXPIRY_MINUTES = 30;
const REFRESH_TOKEN_EXPIRY_DAYS = 30;
const MAX_OTP_ATTEMPTS = 5;

const IS_PROD = process.env.NODE_ENV === "production";

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie("auth_token", accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? "strict" : "lax",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth/refresh",
  });
}

function clearAuthCookies(res) {
  res.clearCookie("auth_token");
  res.clearCookie("refresh_token", { path: "/api/auth/refresh" });
}

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id ?? user.userId,
      tenantId: user.tenantId,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: `${AUTH_TOKEN_EXPIRY_MINUTES}m` },
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
  const permissions = user.permissions
    ? Object.entries(
        user.permissions instanceof Map
          ? Object.fromEntries(user.permissions)
          : user.permissions,
      )
        .filter(([, v]) => v === true)
        .map(([k]) => k)
    : [];

  return {
    _id: user._id?.toString() ?? user.id?.toString(),
    roleId: user.roleId?.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    permissions,
    tenantId: user.tenantId?.toString(),
  };
}

export const register = asyncCatch(async (req, res) => {
  const { password, name, ...userData } = req.body;

  const existingUser = await userModel.findOne({
    email: userData.email,
  });
  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
  }

  let tenantId = userData.tenantId;
  if (name && !tenantId) {
    const tenant = await tenantModel.create({
      name,
      email: userData.email,
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

  setAuthCookies(res, accessToken, refreshToken);

  res.status(201).json({
    message: "User registered successfully",
    success: true,
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

        setAuthCookies(res, accessToken, refreshToken);

        return res.json({
          message: "Login successful",
          success: true,
          user: formatUser(user),
        });
      } catch (err) {
        return next(err);
      }
    },
  )(req, res, next);
};

export const logout = asyncCatch(async (req, res) => {
  const rawRefreshToken = req.cookies?.refresh_token;

  if (rawRefreshToken) {
    const tokenHash = RefreshToken.hashToken(rawRefreshToken);
    await RefreshToken.findOneAndUpdate({ tokenHash }, { revoked: true });
  }

  clearAuthCookies(res);
  res.json({ message: "User logged out successfully" });
});

export const refreshToken = asyncCatch(async (req, res) => {
  const rawToken = req.cookies?.refresh_token;

  if (!rawToken) throw new AppError("Refresh token is required", 401);

  const tokenHash = RefreshToken.hashToken(rawToken);
  const storedToken = await RefreshToken.findOne({ tokenHash });

  if (!storedToken) throw new AppError("Invalid refresh token", 401);

  if (storedToken.revoked) {
    // Token reuse detected — revoke the entire family for this user
    await RefreshToken.updateMany(
      { userId: storedToken.userId },
      { revoked: true },
    );
    clearAuthCookies(res);
    throw new AppError(
      "Refresh token reuse detected. Please log in again.",
      401,
    );
  }

  if (storedToken.expiresAt < new Date()) {
    clearAuthCookies(res);
    throw new AppError("Refresh token expired", 401);
  }

  // Rotate — revoke old token, issue new pair
  storedToken.revoked = true;
  await storedToken.save();

  const user = await userModel.findById(storedToken.userId).lean();
  if (!user) throw new AppError("User not found", 401);

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = await generateAndStoreRefreshToken(user);

  setAuthCookies(res, newAccessToken, newRefreshToken);

  res.json({ message: "Token refreshed successfully" });
});

export const getProfile = asyncCatch(async (req, res) => {
  const user = await userModel.findById(req.user.email).populate("roleId");
  if (!user) throw new AppError("User not found", 404);
  res.json({
    user: formatUser(user),
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

  const user = await userModel.findOne({ email: email });
  if (!user) {
    return res.json({
      message: "If an account exists, an OTP has been sent to your email",
      expiresIn: OTP_EXPIRY_MINUTES * 60,
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const redisKey = `otp:${email}`;

  await otpCache.set(
    redisKey,
    JSON.stringify({ otp, attempts: 0 }),
    OTP_EXPIRY_MINUTES * 60,
  );

  try {
    await emailController.sendOTPEmail(email, otp);
  } catch (emailError) {
    console.error("Email sending failed:", emailError);
    await otpCache.delete(redisKey);
    throw new AppError("Failed to send OTP. Please try again.", 500);
  }

  res.json({
    message: "OTP has been sent to your email",
    expiresIn: OTP_EXPIRY_MINUTES * 60,
  });
});

export const verifyPasswordResetOTP = asyncCatch(async (req, res) => {
  const { email, otp } = req.body;

  const redisKey = `otp:${email}`;
  const raw = await otpCache.get(redisKey);

  if (!raw) {
    throw new AppError(
      "Invalid or expired OTP. Please request a new one.",
      400,
    );
  }

  const record = typeof raw === "string" ? JSON.parse(raw) : raw;

  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    await otpCache.delete(redisKey);
    throw new AppError(
      "Too many failed attempts. Please request a new OTP.",
      429,
    );
  }

  if (record.otp !== otp) {
    record.attempts += 1;
    await otpCache.set(
      redisKey,
      JSON.stringify(record),
      OTP_EXPIRY_MINUTES * 60,
    );
    const attemptsLeft = MAX_OTP_ATTEMPTS - record.attempts;
    throw new AppError(`Invalid OTP. ${attemptsLeft} attempts remaining.`, 400);
  }

  // Valid — delete OTP immediately
  await otpCache.delete(redisKey);

  const resetToken = jwt.sign(
    { email, type: "password-reset" },
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

  const user = await userModel.findOne({ email: decoded.email });
  if (!user) throw new AppError("User not found.", 404);

  user.password = newPassword;
  await user.save();

  await otpCache.delete(`otp:${decoded.email}`);

  try {
    await emailController.sendPasswordResetConfirmation(decoded.email);
  } catch (emailError) {
    console.warn("Failed to send confirmation email:", emailError);
  }

  res.json({
    message: "Password has been reset successfully. You can now log in.",
  });
});
