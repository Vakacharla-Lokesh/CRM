import { Router } from 'express';
import { getAllAttachments, getAttachmentById, getPresignedUploadUrl, createAttachment, deleteAttachment, getAttachmentsByLead, downloadAttachment } from '../controllers/attachmentController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/rbac.js';
import { presignedUrlSchema, createAttachmentSchema } from '../validators/attachmentsValidator.js';
import passport from '../config/passport.js';

const router = Router();
router.use(passport.authenticate('jwt', { session: false }));

router.get('/', authenticate, requirePermission('attachments:read'), getAllAttachments);
router.post('/presigned-url', authenticate, requirePermission('attachments:write'), validate(presignedUrlSchema), getPresignedUploadUrl);
router.get('/:id', authenticate, requirePermission('attachments:read'), getAttachmentById);
router.post('/', authenticate, requirePermission('attachments:write'), validate(createAttachmentSchema), createAttachment);
router.get('/lead/:leadId', authenticate, requirePermission('attachments:read'), getAttachmentsByLead);
router.delete('/:id', authenticate, requirePermission('attachments:delete'), deleteAttachment);
router.get('/:id/download', authenticate, requirePermission('attachments:read'), downloadAttachment);

export default router;
