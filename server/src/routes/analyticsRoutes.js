import { Router } from 'express';
import { getDashboardStats, getLeadTrends, getLeadStatusBreakdown, getLeadScoreDistribution, getDealPipeline, getDealTrends, getOrganizationStats, getTopOrganizations } from '../controllers/analyticsController.js';
import { authenticate } from '../middlewares/auth.js';
import { requirePermission, injectTenantFilter } from '../middlewares/rbac.js';
import passport from '../config/passport.js';

const router = Router();
const auth = [authenticate, requirePermission('analytics:read'), injectTenantFilter];

router.use(passport.authenticate('jwt', { session: false }));

router.get('/dashboard', ...auth, getDashboardStats);
router.get('/leads/trends', ...auth, getLeadTrends);
router.get('/leads/status-breakdown', ...auth, getLeadStatusBreakdown);
router.get('/leads/score-distribution', ...auth, getLeadScoreDistribution);
router.get('/deals/pipeline', ...auth, getDealPipeline);
router.get('/deals/trends', ...auth, getDealTrends);
router.get('/organizations/stats', ...auth, getOrganizationStats);
router.get('/organizations/top', ...auth, getTopOrganizations);

export default router;
