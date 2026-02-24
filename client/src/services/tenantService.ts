import { apiClient } from "./api";
import type { Tenant, CreateTenantDto, UpdateTenantDto } from "@/types/tenant";

export interface CursorTenantPage {
  tenants: Tenant[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

class TenantService {
  async getAllTenants(params?: {
    cursor?: string | null;
    limit?: number;
  }): Promise<CursorTenantPage> {
    const queryParams: Record<string, unknown> = { limit: params?.limit ?? 20 };
    if (params?.cursor) queryParams.cursor = params.cursor;

    const response = await apiClient.get<{
      tenants: Tenant[];
      count: number;
      nextCursor: string | null;
      hasNextPage: boolean;
    }>("/tenants", queryParams);

    return {
      tenants: response.tenants,
      nextCursor: response.nextCursor,
      hasNextPage: response.hasNextPage,
    };
  }

  async getTenantById(id: string): Promise<Tenant> {
    const response = await apiClient.get<{ tenant: Tenant }>(`/tenants/${id}`);
    return response.tenant;
  }

  async createTenant(data: CreateTenantDto): Promise<Tenant> {
    const response = await apiClient.post<{ tenant: Tenant; message: string }>(
      "/tenants",
      data,
    );
    return response.tenant;
  }

  async updateTenant(id: string, data: UpdateTenantDto): Promise<Tenant> {
    const response = await apiClient.put<{ tenant: Tenant; message: string }>(
      `/tenants/${id}`,
      data,
    );
    return response.tenant;
  }

  async deleteTenant(id: string): Promise<void> {
    await apiClient.delete(`/tenants/${id}`);
  }
}

const tenantService = new TenantService();
export default tenantService;
