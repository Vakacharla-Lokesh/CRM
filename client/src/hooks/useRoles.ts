import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '../services/api/roles.api';
import type { CreateRoleDTO, UpdateRoleDTO } from '../types/role';
import { useAppContext } from './useAppContext';

/**
 * Hook to fetch all roles for the current tenant
 * Uses TanStack Query with localStorage persistence
 */
export const useRoles = () => {
  const { user } = useAppContext();

  return useQuery({
    queryKey: ['roles', user?.tenantId],
    queryFn: rolesApi.getRoles,
    enabled: !!user?.tenantId, // Only fetch if user is logged in
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch a single role by ID
 */
export const useRole = (roleId?: string) => {
  return useQuery({
    queryKey: ['role', roleId],
    queryFn: () => rolesApi.getRole(roleId!),
    enabled: !!roleId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to create a new role
 */
export const useCreateRole = () => {
  const queryClient = useQueryClient();
  const { user } = useAppContext();

  return useMutation({
    mutationFn: (role: CreateRoleDTO) => rolesApi.createRole(role),
    onSuccess: () => {
      // Invalidate roles cache to refetch
      queryClient.invalidateQueries({ queryKey: ['roles', user?.tenantId] });
    },
  });
};

/**
 * Hook to update an existing role
 */
export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  const { user } = useAppContext();

  return useMutation({
    mutationFn: ({
      roleId,
      updates,
    }: {
      roleId: string;
      updates: UpdateRoleDTO;
    }) => rolesApi.updateRole(roleId, updates),
    onSuccess: (updatedRole) => {
      // Invalidate both the list and the specific role
      queryClient.invalidateQueries({ queryKey: ['roles', user?.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['role', updatedRole._id] });
    },
  });
};

/**
 * Hook to delete a role
 */
export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  const { user } = useAppContext();

  return useMutation({
    mutationFn: (roleId: string) => rolesApi.deleteRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', user?.tenantId] });
    },
  });
};