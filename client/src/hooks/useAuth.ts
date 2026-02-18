import { useAppContext } from "../context";
import { type UserRole } from "../types";

/**
 * Authentication Helper Hook
 * Provides authentication utilities and permission checking
 *
 * @returns {Object} Auth utilities
 */
export const useAuth = () => {
  const { user, token, isAuthenticated, login, logout, signup } =
    useAppContext();

  /**
   * Check if user has specific role
   * @param {string|Array} roles - Role or array of roles
   * @returns {boolean} Has role
   */
  const hasRole = (roles: UserRole | UserRole[]) => {
    if (!user) return false;

    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  /**
   * Check if user has specific permission
   * @param {string} permission - Permission name
   * @returns {boolean} Has permission
   */
  const hasPermission = (permission: string) => {
    if (!user) return false;
    const permissions = getUserPermissions(user.role);
    return permissions[permission as keyof typeof permissions] === true;
  };

  /**
   * Check if user is admin
   * @returns {boolean} Is admin
   */
  const isAdmin = () => {
    return hasRole("admin");
  };

  /**
   * Check if user can perform action
   * @param {string} action - Action name
   * @param {Object} resource - Resource object
   * @returns {boolean} Can perform action
   */
  const can = (action: string, resource: { type?: string } | null = null) => {
    if (!user) return false;

    // Admins can do everything
    if (isAdmin()) return true;

    // Check specific permissions
    const permissionKey = resource ? `${action}_${resource.type}` : action;

    return hasPermission(permissionKey);
  };

  /**
   * Check if user owns resource
   * @param {Object} resource - Resource object
   * @returns {boolean} Owns resource
   */
  const owns = (resource: { userId?: string; ownerId?: string }) => {
    if (!user || !resource) return false;
    return resource.userId === user._id || resource.ownerId === user._id;
  };

  return {
    // State
    user,
    token,
    isAuthenticated,

    // Auth methods
    login,
    logout,
    signup,

    // Permission checks
    hasRole,
    hasPermission,
    isAdmin,
    can,
    owns,
  };
};
