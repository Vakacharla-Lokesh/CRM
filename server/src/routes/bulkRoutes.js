import { Router } from 'express';
import { bulkCreateLeads, bulkUpdateLeads, bulkCreateDeals, bulkUpdateDeals, bulkCreateComments, bulkCreateCalls, bulkCreateOrganizations, bulkUpdateOrganizations } from '../controllers/bulkController.js';
import { authenticate } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/rbac.js';
import passport from '../config/passport.js';
import { validate } from '../middlewares/validate.js';
import { bulkCreateLeadsSchema, bulkUpdateLeadsSchema, bulkCreateDealsSchema, bulkUpdateDealsSchema, bulkCreateCommentsSchema, bulkCreateCallsSchema, bulkCreateOrganizationsSchema, bulkUpdateOrganizationsSchema } from '../validators/bulkValidator.js';

const router = Router();
router.use(passport.authenticate('jwt', { session: false }));

router.post('/leads/create', authenticate, requirePermission('bulk:import'), validate(bulkCreateLeadsSchema), bulkCreateLeads);
router.post('/leads/update', authenticate, requirePermission('bulk:import'), validate(bulkUpdateLeadsSchema), bulkUpdateLeads);
router.post('/deals/create', authenticate, requirePermission('bulk:import'), validate(bulkCreateDealsSchema), bulkCreateDeals);
router.post('/deals/update', authenticate, requirePermission('bulk:import'), validate(bulkUpdateDealsSchema), bulkUpdateDeals);
router.post('/comments/create', authenticate, requirePermission('bulk:import'), validate(bulkCreateCommentsSchema), bulkCreateComments);
router.post('/calls/create', authenticate, requirePermission('bulk:import'), validate(bulkCreateCallsSchema), bulkCreateCalls);
router.post('/organizations/create', authenticate, requirePermission('bulk:import'), validate(bulkCreateOrganizationsSchema), bulkCreateOrganizations);
router.post('/organizations/update', authenticate, requirePermission('bulk:import'), validate(bulkUpdateOrganizationsSchema), bulkUpdateOrganizations);

export default router;
