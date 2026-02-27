import { Router } from 'express';
import { getJobStatus } from '../controllers/jobController.js';
import { authenticate } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/rbac.js';
import passport from '../config/passport.js';

const router = Router();
router.use(passport.authenticate('jwt', { session: false }));

router.get('/:jobId', authenticate, requirePermission('settings:read'), getJobStatus);

export default router;
