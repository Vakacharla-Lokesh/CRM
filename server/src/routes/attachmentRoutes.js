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
import { authenticateRequest } from "../middlewares/auth.js";
import { requirePermission, injectTenantContext } from "../middlewares/rbac.js";
import {
  presignedUrlSchema,
  createAttachmentSchema,
} from "../validators/attachmentsValidator.js";

const router = Router();

router.get(
  "/",
  authenticateRequest,
  requirePermission("attachments:read"),
  injectTenantContext,
  getAllAttachments,
);
router.post(
  "/presigned-url",
  authenticateRequest,
  requirePermission("attachments:write"),
  injectTenantContext,
  validate(presignedUrlSchema),
  getPresignedUploadUrl,
);
router.get(
  "/:id",
  authenticateRequest,
  requirePermission("attachments:read"),
  injectTenantContext,
  getAttachmentById,
);
router.post(
  "/",
  authenticateRequest,
  requirePermission("attachments:write"),
  injectTenantContext,
  validate(createAttachmentSchema),
  createAttachment,
);
router.get(
  "/lead/:leadId",
  authenticateRequest,
  requirePermission("attachments:read"),
  injectTenantContext,
  getAttachmentsByLead,
);
router.delete(
  "/:id",
  authenticateRequest,
  requirePermission("attachments:delete"),
  injectTenantContext,
  deleteAttachment,
);
router.get(
  "/:id/download",
  authenticateRequest,
  requirePermission("attachments:read"),
  injectTenantContext,
  downloadAttachment,
);

export default router;
