import { Router } from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, getUsersByTenant, updateUserRole, getCurrentUser, searchUsers, getUserStats, updatePassword, sendPasswordReset, updateProfile, getUserActivity, getUserPermissions, assignRoleToUser } from '../controllers/userController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, checkActive } from '../middlewares/auth.js';
import { requirePermission, injectTenantFilter } from '../middlewares/rbac.js';
import { createUserSchema, updateUserSchema, updateRoleSchema, updatePasswordSchema, passwordResetSchema, updateProfileSchema } from '../validators/userValidators.js';
import passport from '../config/passport.js';
import { assignRoleSchema } from '../validators/roleValidator.js';

const router = Router();
router.use(passport.authenticate('jwt', { session: false }));

router.post('/password-reset', validate(passwordResetSchema), sendPasswordReset);
router.get('/me', authenticate, getCurrentUser);
router.get('/search', authenticate, checkActive, requirePermission('users:read'), injectTenantFilter, searchUsers);
router.get('/stats', authenticate, checkActive, requirePermission('users:read'), injectTenantFilter, getUserStats);
router.get('/', authenticate, checkActive, requirePermission('users:read'), injectTenantFilter, getAllUsers);
router.post('/', authenticate, requirePermission('users:write'), validate(createUserSchema), createUser);
router.get('/tenant/:tenantId', authenticate, requirePermission('super_admin'), getUsersByTenant);
router.get('/:id', authenticate, checkActive, requirePermission('users:read'), getUserById);
router.put('/:id', authenticate, requirePermission('users:write'), validate(updateUserSchema), updateUser);
router.delete('/:id', authenticate, requirePermission('users:delete'), deleteUser);
router.patch('/:id/role', authenticate, requirePermission('users:manage_roles'), validate(assignRoleSchema), assignRoleToUser);
router.put('/:id/password', authenticate, validate(updatePasswordSchema), updatePassword);
router.patch('/:id/profile', authenticate, validate(updateProfileSchema), updateProfile);
router.get('/:id/activity', authenticate, getUserActivity);
router.get('/:id/permissions', authenticate, getUserPermissions);

export default router;
