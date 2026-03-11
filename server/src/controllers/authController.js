import passport from "../config/passport.js";
import asyncCatch from "../utils/asyncCatch.js";
import * as authService from "../services/authService.js";

import envConfig from "../config/envConfig.js";

const IS_PROD = envConfig.isProduction;

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

export const register = asyncCatch(async (req, res) => {
  const user = await authService.registerUser(req.body);

  const accessToken = authService.generateAccessToken(user);
  const refreshToken = await authService.generateAndStoreRefreshToken(user);

  setAuthCookies(res, accessToken, refreshToken);

  res.status(201).json({
    message: "User registered successfully",
    success: true,
    user: authService.formatUser(user),
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
        const accessToken = authService.generateAccessToken(user);
        const refreshToken =
          await authService.generateAndStoreRefreshToken(user);

        setAuthCookies(res, accessToken, refreshToken);

        return res.json({
          message: "Login successful",
          success: true,
          user: authService.formatUser(user),
        });
      } catch (err) {
        return next(err);
      }
    },
  )(req, res, next);
};

export const logout = asyncCatch(async (req, res) => {
  const rawRefreshToken = req.cookies?.refresh_token;

  await authService.revokeRefreshToken(rawRefreshToken);

  clearAuthCookies(res);
  res.json({ message: "User logged out successfully" });
});

export const refreshToken = asyncCatch(async (req, res) => {
  const rawToken = req.cookies?.refresh_token;

  try {
    const { newAccessToken, newRefreshToken } =
      await authService.rotateRefreshToken(rawToken);

    setAuthCookies(res, newAccessToken, newRefreshToken);

    res.json({ message: "Token refreshed successfully" });
  } catch (err) {
    clearAuthCookies(res);
    throw err;
  }
});

export const getProfile = asyncCatch(async (req, res) => {
  const user = await authService.getProfileByEmail(req.user.email);

  res.json({
    user: authService.formatUser(user),
  });
});

export const checkToken = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.json({ valid: false });
  }

  const token = authHeader.slice(7);
  return res.json({ valid: authService.verifyToken(token) });
};

export const requestPasswordResetOTP = asyncCatch(async (req, res) => {
  const { email } = req.body;

  const result = await authService.requestOTP(email);

  if (!result.userExists) {
    return res.json({
      message: "If an account exists, an OTP has been sent to your email",
      expiresIn: 300,
    });
  }

  res.json({
    message: "OTP has been sent to your email",
    expiresIn: result.expiresIn,
  });
});

export const verifyPasswordResetOTP = asyncCatch(async (req, res) => {
  const { email, otp } = req.body;

  const { resetToken, expiresIn } = await authService.verifyOTP(email, otp);

  res.json({
    message: "OTP verified successfully",
    resetToken,
    expiresIn,
  });
});

export const resetPassword = asyncCatch(async (req, res) => {
  const { resetToken, newPassword } = req.body;

  await authService.resetPassword(resetToken, newPassword);

  res.json({
    message: "Password has been reset successfully. You can now log in.",
  });
});
