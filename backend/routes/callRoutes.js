import { Router } from "express";
import { z } from "zod";
import {
  getAllCalls,
  getCallById,
  createCall,
  updateCall,
  deleteCall,
  getCallsByLead,
} from "../controllers/callController.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";
import { authorize } from "../middlewares/rbac.js";
import { createCallSchema } from "../validators/calls.validator.js";

const router = Router();

// Validation schemas
const updateCallSchema = z
  .object({
    callType: z.enum(["incoming", "outgoing"]).optional(),
    callNotes: z.string().max(250).optional(),
    status: z
      .enum(["completed", "missed", "no-answer", "voicemail"])
      .optional(),
    duration: z.number().int().min(1).max(1000).optional(),
  })
  .strict();

// Routes
router.get(
  "/",
  authenticate,
  authorize("user", "admin", "super_admin"),
  getAllCalls,
);

router.get(
  "/:id",
  authenticate,
  authorize("user", "admin", "super_admin"),
  getCallById,
);

router.post(
  "/",
  authenticate,
  authorize("user", "admin", "super_admin"),
  validate(createCallSchema),
  createCall,
);

router.put(
  "/:id",
  authenticate,
  authorize("user", "admin", "super_admin"),
  validate(updateCallSchema),
  updateCall,
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin", "super_admin"),
  deleteCall,
);

router.get(
  "/lead/:leadId",
  authenticate,
  authorize("user", "admin", "super_admin"),
  getCallsByLead,
);

export default router;
