import { apiClient } from "./api";
import type { Deal } from "../types";

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

const dealService = {
  getAllDeals: async (): Promise<Deal[]> => {
    const response = await apiClient.get<{
      count: number;
      deals: Deal[];
    }>("/deals");
    return response.deals;
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

  updateDeal: async (id: string, updates: Partial<Deal>): Promise<Deal> => {
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
    return apiClient.get<Deal[]>(
      `/deals/search?q=${encodeURIComponent(query)}`,
    );
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
    updates: Partial<Deal>,
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
