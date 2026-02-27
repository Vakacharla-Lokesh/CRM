import { Router } from 'express';
import { exportLeads, exportOrganizations, exportDeals, exportLeadsToEmail, exportOrganizationsToEmail, exportDealsToEmail } from '../controllers/exportController.js';
import { authenticate } from '../middlewares/auth.js';
import { requirePermission, injectTenantFilter } from '../middlewares/rbac.js';
import { validate } from '../middlewares/validate.js';
import { exportLeadsSchema, exportOrganizationsSchema, exportDealsSchema, exportLeadsToEmailSchema, exportOrganizationsToEmailSchema, exportDealsToEmailSchema } from '../validators/exportValidator.js';
import passport from '../config/passport.js';

const router = Router();
router.use(passport.authenticate('jwt', { session: false }));

router.post('/leads', authenticate, requirePermission('leads:export'), injectTenantFilter, validate(exportLeadsSchema), exportLeads);
router.post('/organizations', authenticate, requirePermission('organizations:export'), injectTenantFilter, validate(exportOrganizationsSchema), exportOrganizations);
router.post('/deals', authenticate, requirePermission('deals:export'), injectTenantFilter, validate(exportDealsSchema), exportDeals);
router.post('/leads/toemail', authenticate, requirePermission('leads:export'), injectTenantFilter, validate(exportLeadsToEmailSchema), exportLeadsToEmail);
router.post('/organizations/toemail', authenticate, requirePermission('organizations:export'), injectTenantFilter, validate(exportOrganizationsToEmailSchema), exportOrganizationsToEmail);
router.post('/deals/toemail', authenticate, requirePermission('deals:export'), injectTenantFilter, validate(exportDealsToEmailSchema), exportDealsToEmail);

export default router;
