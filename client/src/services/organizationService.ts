import { apiClient } from "./api";
import type { Organization } from "../types";

interface OrganizationStats {
  total: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  byStage: Record<string, number>;
}

interface OrganizationActivity {
  id: string;
  organizationId: string;
  type: string;
  description: string;
  userId: string;
  createdAt: string;
}

export interface CursorOrgPage {
  organizations: Organization[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

const organizationService = {
  getAllOrganizations: async (params?: {
    cursor?: string | null;
    limit?: number;
    industry?: string;
  }): Promise<CursorOrgPage> => {
    const queryParams: Record<string, unknown> = { limit: params?.limit ?? 20 };
    if (params?.cursor) queryParams.cursor = params.cursor;
    if (params?.industry) queryParams.industry = params.industry;

    const response = await apiClient.get<{
      count: number;
      organizations: Organization[];
      nextCursor: string | null;
      hasNextPage: boolean;
    }>("/organizations", queryParams);

    return {
      organizations: response.organizations,
      nextCursor: response.nextCursor,
      hasNextPage: response.hasNextPage,
    };
  },

  getOrganizationById: async (id: string): Promise<Organization> => {
    const response = await apiClient.get<{ organization: Organization }>(
      `/organizations/${id}`,
    );
    return response.organization;
  },

  createOrganization: async (
    organizationData: Partial<Organization>,
  ): Promise<Organization> => {
    const response = await apiClient.post<{
      message: string;
      organization: Organization;
    }>("/organizations", organizationData);
    return response.organization;
  },

  updateOrganization: async (
    id: string,
    updates: Partial<Organization>,
  ): Promise<Organization> => {
    const response = await apiClient.put<{
      message: string;
      organization: Organization;
    }>(`/organizations/${id}`, updates);
    return response.organization;
  },

  deleteOrganization: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/organizations/${id}`);
  },

  searchOrganizations: async (query: string): Promise<Organization[]> => {
    const response = await apiClient.get<{
      count: number;
      organizations: Organization[];
    }>(`/organizations/search?q=${encodeURIComponent(query)}`);
    return response.organizations;
  },

  getOrganizationStats: async (): Promise<OrganizationStats> => {
    return apiClient.get<OrganizationStats>("/organizations/stats");
  },

  getOrganizationsByStatus: async (status: string): Promise<Organization[]> => {
    return apiClient.get<Organization[]>(
      `/organizations?status=${encodeURIComponent(status)}`,
    );
  },

  getOrganizationsBySource: async (source: string): Promise<Organization[]> => {
    return apiClient.get<Organization[]>(
      `/organizations?source=${encodeURIComponent(source)}`,
    );
  },

  bulkUpdateOrganizations: async (
    organizationIds: string[],
    updates: Partial<Organization>,
  ): Promise<{ message: string; updated: number }> => {
    return apiClient.post<{ message: string; updated: number }>(
      "/organizations/bulk-update",
      { organizationIds, updates },
    );
  },

  bulkDeleteOrganizations: async (
    organizationIds: string[],
  ): Promise<{ message: string; deleted: number }> => {
    return apiClient.post<{ message: string; deleted: number }>(
      "/organizations/bulk-delete",
      { organizationIds },
    );
  },

  exportOrganizations: async (
    format: string = "csv",
    filters: Record<string, string> = {},
  ): Promise<Blob> => {
    const params = new URLSearchParams({ format, ...filters });
    return apiClient.get<Blob>(`/organizations/export?${params.toString()}`);
  },

  importOrganizations: async (
    file: File | Blob,
  ): Promise<{ message: string; imported: number }> => {
    return apiClient.upload<{ message: string; imported: number }>(
      "/organizations/import",
      file,
    );
  },

  assignOrganization: async (
    organizationId: string,
    userId: string,
  ): Promise<Organization> => {
    return apiClient.patch<Organization>(
      `/organizations/${organizationId}/assign`,
      {
        userId,
      },
    );
  },

  convertOrganization: async (
    organizationId: string,
    dealData: unknown,
  ): Promise<{ message: string; dealId: string }> => {
    return apiClient.post<{ message: string; dealId: string }>(
      `/organizations/${organizationId}/convert`,
      dealData,
    );
  },

  addOrganizationNote: async (
    organizationId: string,
    note: string,
  ): Promise<{ message: string; noteId: string }> => {
    return apiClient.post<{ message: string; noteId: string }>(
      `/organizations/${organizationId}/notes`,
      { note },
    );
  },

  getOrganizationActivity: async (
    organizationId: string,
  ): Promise<OrganizationActivity[]> => {
    return apiClient.get<OrganizationActivity[]>(
      `/organizations/${organizationId}/activity`,
    );
  },
};

export default organizationService;
