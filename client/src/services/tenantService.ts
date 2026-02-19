import { apiClient } from "./api";
import type { Tenant, CreateTenantDto, UpdateTenantDto } from "@/types/tenant";

class TenantService {
  async getAllTenants(): Promise<Tenant[]> {
    const response = await apiClient.get<{ tenants: Tenant[]; count: number }>(
      "/tenants"
    );
    return response.tenants;
  }

  async getTenantById(id: string): Promise<Tenant> {
    const response = await apiClient.get<{ tenant: Tenant }>(`/tenants/${id}`);
    return response.tenant;
  }

  async createTenant(data: CreateTenantDto): Promise<Tenant> {
    const response = await apiClient.post<{ tenant: Tenant; message: string }>(
      "/tenants",
      data
    );
    return response.tenant;
  }

  async updateTenant(id: string, data: UpdateTenantDto): Promise<Tenant> {
    const response = await apiClient.put<{ tenant: Tenant; message: string }>(
      `/tenants/${id}`,
      data
    );
    return response.tenant;
  }

  async deleteTenant(id: string): Promise<void> {
    await apiClient.delete(`/tenants/${id}`);
  }
}

const tenantService = new TenantService();
export default tenantService;
