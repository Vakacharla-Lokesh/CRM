import jwt from "jsonwebtoken";
import crypto from "crypto";
import userModel from "../../users/models/userModel.js";
import tenantModel from "../../tenants/models/tenantModel.js";
import RefreshToken from "../models/refreshTokenModel.js";
import AppError from "../../../utils/appError.js";
import { otpCache } from "../../../config/cache.js";
import emailController from "../../emails/controllers/emailController.js";
import { seedDefaultPipeline } from "../../pipelines/services/pipelineService.js";
import envConfig from "../../../config/envConfig.js";
import { wrapServiceFn } from "../../../utils/serviceWrapper.js";

const OTP_EXPIRY_MINUTES = 5;
const RESET_TOKEN_EXPIRY_MINUTES = 15;
const AUTH_TOKEN_EXPIRY_MINUTES = 30;
const REFRESH_TOKEN_EXPIRY_DAYS = 30;
const MAX_OTP_ATTEMPTS = 5;

export const generateAccessToken = (user) => {
  let permissions = [];

  if (user.permissions) {
    try {
      // Handle Map type from Mongoose
      if (user.permissions instanceof Map) {
        permissions = Array.from(user.permissions.entries())
          .filter(([, v]) => v === true)
          .map(([k]) => k);
      } else if (typeof user.permissions === "object") {
        // Handle plain object
        permissions = Object.entries(user.permissions)
          .filter(([, v]) => v === true)
          .map(([k]) => k);
      }
    } catch (err) {
      console.error("Error processing permissions for token:", err);
      permissions = [];
    }
  }

  const tenant = tenantModel.findById(user.tenantId);

  return jwt.sign(
    {
      userId: user._id ?? user.userId,
      tenantId: user.tenantId,
      tenantName: tenant.name,
      role: user.role,
      permissions,
    },
    envConfig.jwtSecret,
    { expiresIn: `${AUTH_TOKEN_EXPIRY_MINUTES}m` },
  );
};

export const generateAndStoreRefreshToken = wrapServiceFn(async (payload) => {
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
});

export const formatUser = (user) => {
  let permissions = [];

  if (user.permissions) {
    try {
      // Handle Map type from Mongoose
      if (user.permissions instanceof Map) {
        permissions = Array.from(user.permissions.entries())
          .filter(([, v]) => v === true)
          .map(([k]) => k);
      } else if (typeof user.permissions === "object") {
        // Handle plain object
        permissions = Object.entries(user.permissions)
          .filter(([, v]) => v === true)
          .map(([k]) => k);
      }
    } catch (err) {
      console.error("Error processing permissions:", err);
      permissions = [];
    }
  }

  return {
    _id: user._id?.toString() ?? user.id?.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    permissions,
    tenantId: user.tenantId?._id?.toString() ?? user.tenantId?.toString(),
    tenantName: user.tenantId?.name ?? undefined,
  };
};

export const registerUser = wrapServiceFn(
  async ({ password, name, ...userData }) => {
    const existingUser = await userModel.findOne({ email: userData.email });
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
      throw new AppError(
        "Tenant information is required for registration",
        400,
      );
    }

    const user = await userModel.create({ ...userData, tenantId, password });

    await seedDefaultPipeline(user._id, tenantId).catch((err) => {
      console.error("Failed to seed default pipeline for user:", err);
    });

    return user;
  },
);

export const revokeRefreshToken = wrapServiceFn(async (rawRefreshToken) => {
  if (rawRefreshToken) {
    const tokenHash = RefreshToken.hashToken(rawRefreshToken);
    await RefreshToken.findOneAndUpdate({ tokenHash }, { revoked: true });
  }
});

export const rotateRefreshToken = wrapServiceFn(async (rawToken) => {
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

  return { newAccessToken, newRefreshToken, tokenReused: false };
});

export const getProfileByEmail = wrapServiceFn(async (email) => {
  const user = await userModel.findOne({ email }).populate("roleId");
  if (!user) throw new AppError("User not found", 404);
  return user;
});

export const getProfileById = wrapServiceFn(async (userId) => {
  const user = await userModel
    .findById(userId)
    .populate("roleId")
    .populate("tenantId", "name");
  if (!user) throw new AppError("User not found", 404);
  return user;
});

export const verifyToken = (token) => {
  try {
    jwt.verify(token, envConfig.jwtSecret);
    return true;
  } catch {
    return false;
  }
};

export const requestOTP = wrapServiceFn(async (email) => {
  const user = await userModel.findOne({ email });
  if (!user) return { userExists: false };

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

  return { userExists: true, expiresIn: OTP_EXPIRY_MINUTES * 60 };
});

export const verifyOTP = wrapServiceFn(async (email, otp) => {
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

  await otpCache.delete(redisKey);

  const resetToken = jwt.sign(
    { email, type: "password-reset" },
    envConfig.jwtSecret,
    { expiresIn: `${RESET_TOKEN_EXPIRY_MINUTES}m` },
  );

  return { resetToken, expiresIn: RESET_TOKEN_EXPIRY_MINUTES * 60 };
});

export const resetPassword = wrapServiceFn(async (resetToken, newPassword) => {
  let decoded;
  try {
    decoded = jwt.verify(resetToken, envConfig.jwtSecret);
  } catch {
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
});
