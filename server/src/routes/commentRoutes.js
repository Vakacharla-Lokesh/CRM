import { Router } from 'express';
import { getAllComments, getCommentById, createComment, updateComment, deleteComment, getCommentsByLead } from '../controllers/commentController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/rbac.js';
import { createCommentSchema, updateCommentSchema } from '../validators/commentsValidator.js';
import passport from '../config/passport.js';

const router = Router();
router.use(passport.authenticate('jwt', { session: false }));

router.get('/', authenticate, requirePermission('comments:read'), getAllComments);
router.get('/:id', authenticate, requirePermission('comments:read'), getCommentById);
router.post('/', authenticate, requirePermission('comments:write'), validate(createCommentSchema), createComment);
router.put('/:id', authenticate, requirePermission('comments:write'), validate(updateCommentSchema), updateComment);
router.delete('/:id', authenticate, requirePermission('comments:delete'), deleteComment);
router.get('/lead/:leadId', authenticate, requirePermission('comments:read'), getCommentsByLead);

export default router;
