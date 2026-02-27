import { Router } from 'express';
import { getAllCalls, getCallById, createCall, updateCall, deleteCall, getCallsByLead } from '../controllers/callController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/rbac.js';
import { createCallSchema, updateCallSchema } from '../validators/callsValidator.js';
import passport from '../config/passport.js';

const router = Router();
router.use(passport.authenticate('jwt', { session: false }));

router.get('/', authenticate, requirePermission('calls:read'), getAllCalls);
router.get('/:id', authenticate, requirePermission('calls:read'), getCallById);
router.post('/', authenticate, requirePermission('calls:write'), validate(createCallSchema), createCall);
router.put('/:id', authenticate, requirePermission('calls:write'), validate(updateCallSchema), updateCall);
router.delete('/:id', authenticate, requirePermission('calls:delete'), deleteCall);
router.get('/lead/:leadId', authenticate, requirePermission('calls:read'), getCallsByLead);

export default router;
