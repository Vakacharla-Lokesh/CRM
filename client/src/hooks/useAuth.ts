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

export const useAuth = () => {
  const { user, token, isAuthenticated, login, logout, signup } =
    useAppContext();

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;

    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    const permissions = getUserPermissions(user.role);
    return permissions[permission] === true;
  };

  const isAdmin = (): boolean => {
    return hasRole("admin");
  };

  const can = (action: string, resource: Resource | null = null): boolean => {
    if (!user) return false;

    if (isAdmin()) return true;

    const permissionKey = resource ? `${action}_${resource.type}` : action;

    return hasPermission(permissionKey);
  };

  const owns = (resource: Resource): boolean => {
    if (!user || !resource) return false;
    return resource.userId === user._id || resource.ownerId === user._id;
  };

  const isLoggedIn = (): boolean => {
    return isAuthenticated && !!token;
  };

  const getRole = (): UserRole | null => {
    return user?.role ?? null;
  };

  const getUserId = (): string | null => {
    return user?._id ?? null;
  };

  const getUserEmail = (): string | null => {
    return user?.userEmail ?? null;
  };

  const getAllPermissions = (): PermissionMap => {
    if (!user) return {};
    return getUserPermissions(user.role);
  };

  const canEdit = (resource: Resource): boolean => {
    if (!user) return false;
    if (isAdmin()) return true;
    return owns(resource);
  };

  const canDelete = (resource: Resource): boolean => {
    if (!user) return false;
    if (isAdmin()) return true;
    return owns(resource);
  };

  const canView = (resource: Resource): boolean => {
    if (!user) return false;
    if (isAdmin()) return true;
    return owns(resource) || hasPermission(`read_${resource.type}`);
  };

  return {
    user,
    token,
    isAuthenticated,

    login,
    logout,
    signup,

    hasRole,
    hasPermission,
    isAdmin,
    can,
    owns,
    canEdit,
    canDelete,
    canView,

    isLoggedIn,
    getRole,
    getUserId,
    getUserEmail,
    getAllPermissions,
  };
};
