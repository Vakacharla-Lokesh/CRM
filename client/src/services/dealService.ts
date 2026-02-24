import { apiClient } from "./api";
import type { Deal, UpdateDealDTO } from "../types";

interface DealStats {
  total: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  byStage: Record<string, number>;
}

interface DealActivity {
  id: string;
  dealId: string;
  type: string;
  description: string;
  userId: string;
  createdAt: string;
}

export interface CursorDealPage {
  deals: Deal[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

const dealService = {
  getAllDeals: async (params?: {
    cursor?: string | null;
    limit?: number;
  }): Promise<CursorDealPage> => {
    const queryParams: Record<string, unknown> = { limit: params?.limit ?? 20 };
    if (params?.cursor) queryParams.cursor = params.cursor;

    const response = await apiClient.get<{
      count: number;
      deals: Deal[];
      nextCursor: string | null;
      hasNextPage: boolean;
    }>("/deals", queryParams);

    return {
      deals: response.deals,
      nextCursor: response.nextCursor,
      hasNextPage: response.hasNextPage,
    };
  },

  getDealById: async (id: string): Promise<Deal> => {
    const response = await apiClient.get<{ deal: Deal }>(`/deals/${id}`);
    return response.deal;
  },

  createDeal: async (dealData: Partial<Deal>): Promise<Deal> => {
    const response = await apiClient.post<{
      message: string;
      deal: Deal;
    }>("/deals", dealData);
    return response.deal;
  },

  updateDeal: async (id: string, updates: UpdateDealDTO): Promise<Deal> => {
    const response = await apiClient.put<{
      message: string;
      deal: Deal;
    }>(`/deals/${id}`, updates);
    return response.deal;
  },

  deleteDeal: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/deals/${id}`);
  },

  searchDeals: async (query: string): Promise<Deal[]> => {
    const response = await apiClient.get<{
      count: number;
      deals: Deal[];
    }>(`/deals/search?q=${encodeURIComponent(query)}`);
    return response.deals;
  },

  getDealStats: async (): Promise<DealStats> => {
    return apiClient.get<DealStats>("/deals/stats");
  },

  getDealsByStatus: async (status: string): Promise<Deal[]> => {
    return apiClient.get<Deal[]>(`/deals?status=${encodeURIComponent(status)}`);
  },

  getDealsBySource: async (source: string): Promise<Deal[]> => {
    return apiClient.get<Deal[]>(`/deals?source=${encodeURIComponent(source)}`);
  },

  getDealsByStage: async (stage: string): Promise<Deal[]> => {
    return apiClient.get<Deal[]>(`/deals?stage=${encodeURIComponent(stage)}`);
  },

  bulkUpdateDeals: async (
    dealIds: string[],
    updates: UpdateDealDTO,
  ): Promise<{ message: string; updated: number }> => {
    return apiClient.post<{ message: string; updated: number }>(
      "/deals/bulk-update",
      { dealIds, updates },
    );
  },

  bulkDeleteDeals: async (
    dealIds: string[],
  ): Promise<{ message: string; deleted: number }> => {
    return apiClient.post<{ message: string; deleted: number }>(
      "/deals/bulk-delete",
      { dealIds },
    );
  },

  exportDeals: async (
    format: string = "csv",
    filters: Record<string, string> = {},
  ): Promise<Blob> => {
    const params = new URLSearchParams({ format, ...filters });
    return apiClient.get<Blob>(`/deals/export?${params.toString()}`);
  },

  importDeals: async (
    file: File | Blob,
  ): Promise<{ message: string; imported: number }> => {
    return apiClient.upload<{ message: string; imported: number }>(
      "/deals/import",
      file,
    );
  },

  assignDeals: async (dealIds: string[], userId: string): Promise<Deal[]> => {
    return apiClient.patch<Deal[]>(`/deals/assign`, {
      dealIds,
      userId,
    });
  },

  convertDeal: async (
    dealId: string,
    dealData: unknown,
  ): Promise<{ message: string; dealId: string }> => {
    return apiClient.post<{ message: string; dealId: string }>(
      `/deals/${dealId}/convert`,
      dealData,
    );
  },

  addDealNote: async (
    dealId: string,
    note: string,
  ): Promise<{ message: string; noteId: string }> => {
    return apiClient.post<{ message: string; noteId: string }>(
      `/deals/${dealId}/notes`,
      { note },
    );
  },

  getDealActivity: async (dealId: string): Promise<DealActivity[]> => {
    return apiClient.get<DealActivity[]>(`/deals/${dealId}/activity`);
  },
};

export default dealService;
