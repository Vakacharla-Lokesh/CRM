import { apiClient } from "./core";
import type { Role, CreateRoleDTO, UpdateRoleDTO } from "../../types/role";

export const rolesApi = {
  getRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get<{ count: number; roles: Role[] }>(
      "/roles",
    );
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

  updateRole: async (roleId: string, updates: UpdateRoleDTO): Promise<Role> => {
    const response = await apiClient.put<{ message: string; role: Role }>(
      `/roles/${roleId}`,
      updates,
    );
    return response.role;
  },

  deleteRole: async (roleId: string): Promise<void> => {
    await apiClient.delete(`/roles/${roleId}`);
  },
};
