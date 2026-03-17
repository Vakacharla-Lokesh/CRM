import { apiClient } from "./core";
import type { Role, CreateRoleDTO, UpdateRoleDTO } from "../../types/role";

export const rolesApi = {
  getRoles: async (tenantId?: string): Promise<Role[]> => {
    const url = tenantId ? `/roles?tenantId=${tenantId}` : "/roles";
    const response = await apiClient.get<{ count: number; roles: Role[] }>(url);
    return response.roles;
  },

  getRole: async (roleId: string): Promise<Role> => {
    const response = await apiClient.get<{ role: Role }>(`/roles/${roleId}`);
    return response.role;
  },

  createRole: async (role: CreateRoleDTO): Promise<Role> => {
    const response = await apiClient.post<{ message: string; role: Role }>(
      "/roles",
      role,
    );
    return response.role;
  },

  updateRole: async (roleId: string, updates: UpdateRoleDTO, lastKnownUpdatedAt?: Date): Promise<Role> => {
    const response = await apiClient.put<{ message: string; role: Role }>(
      `/roles/${roleId}`,
      { ...updates, lastKnownUpdatedAt },
    );
    return response.role;
  },

  deleteRole: async (roleId: string): Promise<void> => {
    await apiClient.delete(`/roles/${roleId}`);
  },
};
