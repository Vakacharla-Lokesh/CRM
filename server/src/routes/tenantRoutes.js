import { Router } from 'express';
import { getAllTenants, getTenantById, createTenant, updateTenant, deleteTenant, searchTenants } from '../controllers/tenantController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, checkActive } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/rbac.js';
import { createTenantSchema, updateTenantSchema } from '../validators/tenantsValidator.js';
import passport from '../config/passport.js';

const router = Router();
router.use(passport.authenticate('jwt', { session: false }));

router.get('/', authenticate, requirePermission('super_admin'), getAllTenants);
router.get('/search', authenticate, requirePermission('super_admin'), searchTenants);
router.get('/:id', authenticate, requirePermission('super_admin'), getTenantById);
router.post('/', authenticate, checkActive, requirePermission('super_admin'), validate(createTenantSchema), createTenant);
router.put('/:id', authenticate, checkActive, requirePermission('super_admin'), validate(updateTenantSchema), updateTenant);
router.delete('/:id', authenticate, requirePermission('super_admin'), deleteTenant);

export default router;
