import { useAppContext } from "../context";
import type { UserRole } from "../types";

interface Resource {
  type?: string;
  userId?: string;
  ownerId?: string;
  [key: string]: unknown;
}

interface PermissionMap {
  [key: string]: boolean;
}

/**
 * Get permissions for a specific role
 */
const getUserPermissions = (role: UserRole): PermissionMap => {
  const permissionMap: Record<UserRole, PermissionMap> = {
    admin: {
      create_lead: true,
      read_lead: true,
      update_lead: true,
      delete_lead: true,
      create_user: true,
      read_user: true,
      update_user: true,
      delete_user: true,
      manage_roles: true,
      view_reports: true,
      manage_settings: true,
    },
    user: {
      create_lead: false,
      read_lead: false,
      update_lead: false,
      delete_lead: false,
      create_user: false,
      read_user: false,
      update_user: false,
      delete_user: false,
      manage_roles: false,
      view_reports: false,
      manage_settings: false,
    },
    super_admin: {
      create_lead: true,
      read_lead: true,
      update_lead: true,
      delete_lead: true,
      create_user: true,
      read_user: true,
      update_user: true,
      delete_user: true,
      manage_roles: true,
      view_reports: true,
      manage_settings: true,
    },
  };

  return permissionMap[role] || {};
};

/**
 * Authentication Helper Hook
 * Provides authentication utilities and permission checking
 *
 * @returns Auth utilities
 */
export const useAuth = () => {
  const { user, token, isAuthenticated, login, logout, signup } =
    useAppContext();

  /**
   * Check if user has specific role
   */
  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;

    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  /**
   * Check if user has specific permission
   */
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    const permissions = getUserPermissions(user.role);
    return permissions[permission] === true;
  };

  /**
   * Check if user is admin
   */
  const isAdmin = (): boolean => {
    return hasRole("admin");
  };

  /**
   * Check if user can perform action
   */
  const can = (action: string, resource: Resource | null = null): boolean => {
    if (!user) return false;

    // Admins can do everything
    if (isAdmin()) return true;

    // Check specific permissions
    const permissionKey = resource ? `${action}_${resource.type}` : action;

    return hasPermission(permissionKey);
  };

  /**
   * Check if user owns resource
   */
  const owns = (resource: Resource): boolean => {
    if (!user || !resource) return false;
    return resource.userId === user._id || resource.ownerId === user._id;
  };

  /**
   * Check if user is authenticated
   */
  const isLoggedIn = (): boolean => {
    return isAuthenticated && !!token;
  };

  /**
   * Get user role
   */
  const getRole = (): UserRole | null => {
    return user?.role ?? null;
  };

  /**
   * Get user ID
   */
  const getUserId = (): string | null => {
    return user?._id ?? null;
  };

  /**
   * Get user email
   */
  const getUserEmail = (): string | null => {
    return user?.userEmail ?? null;
  };

  /**
   * Get all permissions for current user
   */
  const getAllPermissions = (): PermissionMap => {
    if (!user) return {};
    return getUserPermissions(user.role);
  };

  /**
   * Check if user can edit resource
   */
  const canEdit = (resource: Resource): boolean => {
    if (!user) return false;
    if (isAdmin()) return true;
    return owns(resource);
  };

  /**
   * Check if user can delete resource
   */
  const canDelete = (resource: Resource): boolean => {
    if (!user) return false;
    if (isAdmin()) return true;
    return owns(resource);
  };

  /**
   * Check if user can view resource
   */
  const canView = (resource: Resource): boolean => {
    if (!user) return false;
    if (isAdmin()) return true;
    return owns(resource) || hasPermission(`read_${resource.type}`);
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
    canEdit,
    canDelete,
    canView,

    // Utility methods
    isLoggedIn,
    getRole,
    getUserId,
    getUserEmail,
    getAllPermissions,
  };
};
