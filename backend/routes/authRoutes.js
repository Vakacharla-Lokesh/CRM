import { Router } from "express";
import { z } from "zod";
import {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
} from "../controllers/authController.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

// Validation schemas
const registerSchema = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().optional(),
    userEmail: z.string().email("Please provide a valid email address"),
    mobile: z
      .string()
      .regex(/^[1-9]\d{9}$/, "Please provide valid mobile number"),
    role: z.enum(["user", "admin", "super_admin"]),
    password: z.string().min(8),
    tenantId: z.string().optional(),
  })
  .strict();

const loginSchema = z
  .object({
    userEmail: z.string().email().optional(),
    mobile: z.string().optional(),
    password: z.string().min(1),
    tenantId: z.string().optional(),
  })
  .strict()
  .refine((data) => data.userEmail || data.mobile, {
    message: "Either email or mobile is required",
  });

// Routes
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.get("/profile", authenticate, getProfile);

export default router;
