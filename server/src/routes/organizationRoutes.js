import { Router } from 'express';
import { getAllOrganizations, getOrganizationById, createOrganization, updateOrganization, deleteOrganization, getOrganizationsByTenant, getOrganizationsByUser, searchOrganizations, bulkDeleteOrganizationsController } from '../controllers/organizationController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import { requirePermission, injectTenantFilter } from '../middlewares/rbac.js';
import { createOrganizationSchema, updateOrganizationSchema } from '../validators/organizationValidator.js';
import passport from '../config/passport.js';

const router = Router();
router.use(passport.authenticate('jwt', { session: false }));

router.get('/', authenticate, requirePermission('organizations:read'), injectTenantFilter, getAllOrganizations);
router.get('/search', authenticate, requirePermission('organizations:read'), injectTenantFilter, searchOrganizations);
router.post('/bulk-delete', authenticate, requirePermission('organizations:delete'), bulkDeleteOrganizationsController);
router.get('/:id', authenticate, requirePermission('organizations:read'), getOrganizationById);
router.post('/', authenticate, requirePermission('organizations:write'), validate(createOrganizationSchema), createOrganization);
router.put('/:id', authenticate, requirePermission('organizations:write'), validate(updateOrganizationSchema), updateOrganization);
router.delete('/:id', authenticate, requirePermission('organizations:delete'), deleteOrganization);
router.get('/tenant/:tenantId', authenticate, requirePermission('organizations:view_all'), getOrganizationsByTenant);
router.get('/user/:userId', authenticate, requirePermission('organizations:read'), getOrganizationsByUser);

export default router;
