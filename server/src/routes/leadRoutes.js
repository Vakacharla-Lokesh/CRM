import { Router } from 'express';
import { getAllLeads, getLeadById, createLead, updateLead, deleteLead, getLeadsByTenant, getLeadsByUser, getLeadsByOrganization, updateLeadStatus, convertLeadToDeal, updateLeadScoreManually, searchLeads, bulkDeleteLeadsController } from '../controllers/leadController.js';
import { getLeadActivities } from '../controllers/leadActivityController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import { requirePermission, injectTenantFilter } from '../middlewares/rbac.js';
import { createLeadSchema, updateLeadSchema, updateLeadStatusSchema, updateLeadScoreSchema, convertLeadSchema } from '../validators/leadsValidator.js';
import passport from '../config/passport.js';

const router = Router();
router.use(passport.authenticate('jwt', { session: false }));

router.get('/', authenticate, requirePermission('leads:read'), injectTenantFilter, getAllLeads);
router.get('/search', authenticate, requirePermission('leads:read'), injectTenantFilter, searchLeads);
router.post('/bulk-delete', authenticate, requirePermission('leads:delete'), bulkDeleteLeadsController);
router.get('/:id/activities', authenticate, requirePermission('leads:read'), getLeadActivities);
router.get('/:id', authenticate, requirePermission('leads:read'), getLeadById);
router.post('/', authenticate, requirePermission('leads:write'), validate(createLeadSchema), createLead);
router.put('/:id', authenticate, requirePermission('leads:write'), validate(updateLeadSchema), updateLead);
router.delete('/:id', authenticate, requirePermission('leads:delete'), deleteLead);
router.get('/tenant/:tenantId', authenticate, requirePermission('leads:view_all'), getLeadsByTenant);
router.get('/user/:userId', authenticate, requirePermission('leads:read'), getLeadsByUser);
router.get('/organization/:organizationId', authenticate, requirePermission('leads:read'), getLeadsByOrganization);
router.patch('/:id/status', authenticate, requirePermission('leads:write'), validate(updateLeadStatusSchema), updateLeadStatus);
router.patch('/:id/score', authenticate, requirePermission('leads:write'), validate(updateLeadScoreSchema), updateLeadScoreManually);
router.post('/:id/convert', authenticate, requirePermission('leads:write'), validate(convertLeadSchema), convertLeadToDeal);

export default router;
