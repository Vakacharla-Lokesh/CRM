import { Router } from "express";
import {
  getAllAttachments,
  getAttachmentById,
  createAttachment,
  deleteAttachment,
  getAttachmentsByLead,
  downloadAttachment,
} from "../controllers/attachmentController.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";
import { authorize } from "../middlewares/rbac.js";
import { createAttachmentSchema } from "../validators/attachmentsValidator.js";

const router = Router();

// Routes
router.get(
  "/",
  authenticate,
  authorize("user", "admin", "super_admin"),
  getAllAttachments,
);

router.get(
  "/:id",
  authenticate,
  authorize("user", "admin", "super_admin"),
  getAttachmentById,
);

router.post(
  "/",
  authenticate,
  authorize("user", "admin", "super_admin"),
  validate(createAttachmentSchema),
  createAttachment,
);

router.delete(
  "/:id",
  authenticate,
  authorize("user", "admin", "super_admin"),
  deleteAttachment,
);

router.get(
  "/lead/:leadId",
  authenticate,
  authorize("user", "admin", "super_admin"),
  getAttachmentsByLead,
);

router.get(
  "/:id/download",
  authenticate,
  authorize("user", "admin", "super_admin"),
  downloadAttachment,
);

export default router;
