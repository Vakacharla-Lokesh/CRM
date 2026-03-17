import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  checkToken,
  requestPasswordResetOTP,
  verifyPasswordResetOTP,
  resetPassword,
} from "../controllers/authController.js";
import { validate } from "../../../middlewares/validate.js";
import { authenticateRequest } from "../../../middlewares/auth.js";
import {
  loginSchema,
  registerSchema,
  logoutSchema,
  refreshTokenSchema,
} from "../validators/authValidator.js";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyOTPSchema,
} from "../validators/otpValidator.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", validate(logoutSchema), logout);
router.post("/refresh", validate(refreshTokenSchema), refreshToken);
router.get("/profile", authenticateRequest, getProfile);
router.get("/status", checkToken);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  requestPasswordResetOTP,
);
router.post("/verify-otp", validate(verifyOTPSchema), verifyPasswordResetOTP);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;
