import { Router } from "express";
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

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
// router.post("/refresh", refreshToken);
router.get("/profile", authenticate, getProfile);

export default router;
