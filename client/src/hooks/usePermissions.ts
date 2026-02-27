import { useQuery } from "@tanstack/react-query";
import { rolesApi } from "../services/api/roles.api";
import { useAppContext } from "./useAppContext";
import { ALL_PERMISSIONS } from "@/types/constants/permissions";

/**
 * Hook to fetch permissions for a specific role.
 *
 * Resolution order:
 * 1. super_admin  → all permissions, no API call needed
 * 2. user.permissions (hydrated at login) → use as-is, no extra fetch
 * 3. user.roleId  → fetch from /roles/:id/permissions
 */
export const usePermissions = (roleId?: string) => {
  const { user } = useAppContext();

  // Super-admins have every permission — skip API entirely
  const isSuperAdmin = user?.role === "super_admin";

  // Permissions already hydrated into the user object at login time
  const contextPermissions: string[] = user?.permissions ?? [];

  const targetRoleId = roleId || user?.roleId;

  // Only hit the API if we don't already have permissions and aren't super_admin
  const shouldFetch =
    !isSuperAdmin && contextPermissions.length === 0 && !!targetRoleId;

  const query = useQuery({
    queryKey: ["permissions", targetRoleId],
    queryFn: () => rolesApi.getPermissions(targetRoleId!),
    enabled: shouldFetch,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Derive the effective permission list in priority order
  const data: string[] = isSuperAdmin
    ? ALL_PERMISSIONS
    : contextPermissions.length > 0
      ? contextPermissions
      : (query.data ?? []);

  return {
    ...query,
    data,
    isLoading: shouldFetch ? query.isLoading : false,
  };
};

/**
 * Returns true if the current user has the given permission.
 * super_admin always returns true.
 */
export const useHasPermission = (permission: string): boolean => {
  const { user } = useAppContext();
  if (user?.role === "super_admin") return true;
  const { data: permissions = [] } = usePermissions();
  return permissions.includes(permission);
};

/**
 * Returns true if the current user has ALL of the given permissions.
 * super_admin always returns true.
 */
export const useHasAllPermissions = (permissions: string[]): boolean => {
  const { user } = useAppContext();
  if (user?.role === "super_admin") return true;
  const { data: userPermissions = [] } = usePermissions();
  return permissions.every((perm) => userPermissions.includes(perm));
};

/**
 * Returns true if the current user has ANY of the given permissions.
 * super_admin always returns true.
 */
export const useHasAnyPermission = (permissions: string[]): boolean => {
  const { user } = useAppContext();
  if (user?.role === "super_admin") return true;
  const { data: userPermissions = [] } = usePermissions();
  return permissions.some((perm) => userPermissions.includes(perm));
};
