import { useQuery } from "@tanstack/react-query";
import { rolesApi } from "../services/api/roles.api";
import { useAppContext } from "./useAppContext";

/**
 * Hook to fetch permissions for a specific role
 * Uses TanStack Query with localStorage persistence
 *
 * @param roleId - Optional role ID (defaults to current user's roleId)
 */
export const usePermissions = (roleId?: string) => {
  const { user } = useAppContext();
  const targetRoleId = roleId || user?.roleId;

  return useQuery({
    queryKey: ["permissions", targetRoleId],
    queryFn: () => rolesApi.getPermissions(targetRoleId!),
    enabled: !!targetRoleId, // Only fetch if roleId exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook to check if user has a specific permission
 *
 * @param permission - Permission string to check (e.g., 'leads:read')
 * @returns boolean indicating if user has the permission
 */
export const useHasPermission = (permission: string): boolean => {
  const { data: permissions = [] } = usePermissions();
  return permissions.includes(permission);
};

/**
 * Hook to check if user has ALL specified permissions
 *
 * @param permissions - Array of permission strings
 * @returns boolean indicating if user has all permissions
 */
export const useHasAllPermissions = (permissions: string[]): boolean => {
  const { data: userPermissions = [] } = usePermissions();
  return permissions.every((perm) => userPermissions.includes(perm));
};

/**
 * Hook to check if user has ANY of the specified permissions
 *
 * @param permissions - Array of permission strings
 * @returns boolean indicating if user has at least one permission
 */
export const useHasAnyPermission = (permissions: string[]): boolean => {
  const { data: userPermissions = [] } = usePermissions();
  return permissions.some((perm) => userPermissions.includes(perm));
};
