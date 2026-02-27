import { Router } from 'express';
import { getUserAnalyticsDashboard, saveUserAnalyticsDashboard } from '../controllers/userAnalyticsController.js';
import { authenticate } from '../middlewares/auth.js';
import { requirePermission, injectTenantFilter } from '../middlewares/rbac.js';
import passport from '../config/passport.js';

const router = Router();
const auth = [authenticate, requirePermission('analytics:read'), injectTenantFilter];

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', ...auth, getUserAnalyticsDashboard);
router.put('/', ...auth, saveUserAnalyticsDashboard);

export default router;
