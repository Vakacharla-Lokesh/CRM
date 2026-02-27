import { Router } from 'express';
import { getAllDeals, getDealById, createDeal, updateDeal, deleteDeal, getDealsByTenant, getDealsByUser, getDealsByLead, getDealsByOrganization, updateDealStatus, searchDeals, bulkDeleteDealsController } from '../controllers/dealController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import { requirePermission, injectTenantFilter } from '../middlewares/rbac.js';
import { createDealSchema, updateDealSchema, updateDealStatusSchema } from '../validators/dealsValidator.js';
import passport from '../config/passport.js';

const router = Router();
router.use(passport.authenticate('jwt', { session: false }));

router.get('/', authenticate, requirePermission('deals:read'), injectTenantFilter, getAllDeals);
router.get('/search', authenticate, requirePermission('deals:read'), injectTenantFilter, searchDeals);
router.post('/bulk-delete', authenticate, requirePermission('deals:delete'), bulkDeleteDealsController);
router.get('/:id', authenticate, requirePermission('deals:read'), getDealById);
router.post('/', authenticate, requirePermission('deals:write'), validate(createDealSchema), createDeal);
router.put('/:id', authenticate, requirePermission('deals:write'), validate(updateDealSchema), updateDeal);
router.delete('/:id', authenticate, requirePermission('deals:delete'), deleteDeal);
router.get('/tenant/:tenantId', authenticate, requirePermission('deals:view_all'), getDealsByTenant);
router.get('/user/:userId', authenticate, requirePermission('deals:read'), getDealsByUser);
router.get('/lead/:leadId', authenticate, requirePermission('deals:read'), getDealsByLead);
router.get('/organization/:organizationId', authenticate, requirePermission('deals:read'), getDealsByOrganization);
router.patch('/:id/status', authenticate, requirePermission('deals:write'), validate(updateDealStatusSchema), updateDealStatus);

export default router;
