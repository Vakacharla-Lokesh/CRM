import { Router } from "express";
import {
  getAllAttachments,
  getAttachmentById,
  getPresignedUploadUrl,
  createAttachment,
  deleteAttachment,
  getAttachmentsByLead,
  downloadAttachment,
} from "../controllers/attachmentController.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";
import { authorize } from "../middlewares/rbac.js";
import {
  presignedUrlSchema,
  createAttachmentSchema,
} from "../validators/attachmentsValidator.js";
import passport from "../config/passport.js";

const router = Router();

router.use(passport.authenticate("jwt", { session: false }));

// Routes
router.get(
  "/",
  authenticate,
  authorize("user", "admin", "super_admin"),
  getAllAttachments,
);

// Request a presigned PUT URL for direct client-to-S3 upload
router.post(
  "/presigned-url",
  authenticate,
  authorize("user", "admin", "super_admin"),
  validate(presignedUrlSchema),
  getPresignedUploadUrl,
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

router.get(
  "/lead/:leadId",
  authenticate,
  authorize("user", "admin", "super_admin"),
  getAttachmentsByLead,
);

router.delete(
  "/:id",
  authenticate,
  authorize("user", "admin", "super_admin"),
  deleteAttachment,
);

router.get(
  "/:id/download",
  authenticate,
  authorize("user", "admin", "super_admin"),
  downloadAttachment,
);

export default router;
