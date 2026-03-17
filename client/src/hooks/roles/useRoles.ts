import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rolesApi } from "../../services/api/roles.api";
import type { CreateRoleDTO, UpdateRoleDTO } from "../../types/role";
import { useAppContext } from "../useAppContext";

export const useRoles = (targetTenantId?: string) => {
  const { user } = useAppContext();
  const tenantId = targetTenantId || user?.tenantId;

  return useQuery({
    queryKey: ["roles", tenantId],
    queryFn: () => rolesApi.getRoles(targetTenantId),
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useRole = (roleId?: string) => {
  return useQuery({
    queryKey: ["role", roleId],
    queryFn: () => rolesApi.getRole(roleId!),
    enabled: !!roleId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  const { user } = useAppContext();

  return useMutation({
    mutationFn: (role: CreateRoleDTO) => rolesApi.createRole(role),
    onSuccess: () => {
      // Invalidate roles cache to refetch
      queryClient.invalidateQueries({ queryKey: ["roles", user?.tenantId] });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  const { user } = useAppContext();

  return useMutation({
    mutationFn: ({
      roleId,
      updates,
      lastKnownUpdatedAt,
    }: {
      roleId: string;
      updates: UpdateRoleDTO;
      lastKnownUpdatedAt?: Date;
    }) => rolesApi.updateRole(roleId, updates, lastKnownUpdatedAt),
    onSuccess: (updatedRole) => {
      // Invalidate both the list and the specific role
      queryClient.invalidateQueries({ queryKey: ["roles", user?.tenantId] });
      queryClient.invalidateQueries({ queryKey: ["role", updatedRole._id] });
    },
    onError: (err: unknown) => {
      const status = (err as { status?: number }).status;
      if (status === 409) {
        toast.error(
          "This role was modified by someone else. Please refresh and try again.",
        );
        queryClient.invalidateQueries({ queryKey: ["roles", user?.tenantId] });
      }
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  const { user } = useAppContext();

  return useMutation({
    mutationFn: (roleId: string) => rolesApi.deleteRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles", user?.tenantId] });
    },
  });
};
