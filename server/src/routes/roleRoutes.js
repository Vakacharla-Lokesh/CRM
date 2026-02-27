import { Router } from 'express';
import { getAllRoles, getRoleById, createRole, updateRole, deleteRole, getRolePermissions } from '../controllers/roleController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import { requirePermission, injectTenantFilter } from '../middlewares/rbac.js';
import { createRoleSchema, updateRoleSchema } from '../validators/roleValidator.js';
import passport from '../config/passport.js';

const router = Router();
router.use(passport.authenticate('jwt', { session: false }));

router.get('/', authenticate, requirePermission('roles:read'), injectTenantFilter, getAllRoles);
router.get('/:id', authenticate, requirePermission('roles:read'), getRoleById);
router.get('/:id/permissions', authenticate, requirePermission('roles:read'), getRolePermissions);
router.post('/', authenticate, requirePermission('roles:write'), validate(createRoleSchema), createRole);
router.put('/:id', authenticate, requirePermission('roles:write'), validate(updateRoleSchema), updateRole);
router.delete('/:id', authenticate, requirePermission('roles:delete'), deleteRole);

export default router;
