import { useAppContext } from "@/hooks";
import type { UserRole } from "../types";

interface Resource {
  type?: string;
  userId?: string;
  ownerId?: string;
  [key: string]: unknown;
}

export const useAuth = () => {
  const { user, isAuthenticated, login, logout, signup } = useAppContext();

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return (user.permissions ?? []).includes(permission);
  };

  const isAdmin = (): boolean => {
    return hasRole("admin");
  };

  const can = (action: string, resource: Resource | null = null): boolean => {
    if (!user) return false;
    if (isAdmin() || hasRole("super_admin")) return true;
    const permissionKey = resource ? `${action}_${resource.type}` : action;
    return hasPermission(permissionKey);
  };

  const owns = (resource: Resource): boolean => {
    if (!user || !resource) return false;
    return resource.userId === user._id || resource.ownerId === user._id;
  };

  const isLoggedIn = (): boolean => {
    return isAuthenticated;
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

  return {
    user,
    isAuthenticated,
    isLoggedIn,
    hasRole,
    hasPermission,
    isAdmin,
    can,
    owns,
    login,
    logout,
    signup,
    getRole,
    getUserId,
    getUserEmail,
  };
};
