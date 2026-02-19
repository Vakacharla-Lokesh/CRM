import { apiClient } from "./api";
import type { Lead } from "../types";

interface LeadStats {
  total: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  byStage: Record<string, number>;
}

interface LeadActivity {
  id: string;
  leadId: string;
  type: string;
  description: string;
  userId: string;
  createdAt: string;
}

const leadService = {
  getAllLeads: async (): Promise<Lead[]> => {
    return apiClient.get<Lead[]>("/leads");
  },

  getLeadById: async (id: string): Promise<Lead> => {
    return apiClient.get<Lead>(`/leads/${id}`);
  },

  createLead: async (leadData: Partial<Lead>): Promise<Lead> => {
    return apiClient.post<Lead>("/leads", leadData);
  },

  updateLead: async (id: string, updates: Partial<Lead>): Promise<Lead> => {
    return apiClient.put<Lead>(`/leads/${id}`, updates);
  },

  deleteLead: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/leads/${id}`);
  },

  searchLeads: async (query: string): Promise<Lead[]> => {
    return apiClient.get<Lead[]>(
      `/leads/search?q=${encodeURIComponent(query)}`,
    );
  },

  getLeadStats: async (): Promise<LeadStats> => {
    return apiClient.get<LeadStats>("/leads/stats");
  },

  getLeadsByStatus: async (status: string): Promise<Lead[]> => {
    return apiClient.get<Lead[]>(`/leads?status=${encodeURIComponent(status)}`);
  },

  getLeadsBySource: async (source: string): Promise<Lead[]> => {
    return apiClient.get<Lead[]>(`/leads?source=${encodeURIComponent(source)}`);
  },

  getLeadsByStage: async (stage: string): Promise<Lead[]> => {
    return apiClient.get<Lead[]>(`/leads?stage=${encodeURIComponent(stage)}`);
  },

  bulkUpdateLeads: async (
    leadIds: string[],
    updates: Partial<Lead>,
  ): Promise<{ message: string; updated: number }> => {
    return apiClient.post<{ message: string; updated: number }>(
      "/leads/bulk-update",
      { leadIds, updates },
    );
  },

  bulkDeleteLeads: async (
    leadIds: string[],
  ): Promise<{ message: string; deleted: number }> => {
    return apiClient.post<{ message: string; deleted: number }>(
      "/leads/bulk-delete",
      { leadIds },
    );
  },

  exportLeads: async (
    format: string = "csv",
    filters: Record<string, string> = {},
  ): Promise<Blob> => {
    const params = new URLSearchParams({ format, ...filters });
    return apiClient.get<Blob>(`/leads/export?${params.toString()}`);
  },

  importLeads: async (
    file: File | Blob,
  ): Promise<{ message: string; imported: number }> => {
    return apiClient.upload<{ message: string; imported: number }>(
      "/leads/import",
      file,
    );
  },

  assignLead: async (leadId: string, userId: string): Promise<Lead> => {
    return apiClient.patch<Lead>(`/leads/${leadId}/assign`, { userId });
  },

  convertLead: async (
    leadId: string,
    dealData: unknown,
  ): Promise<{ message: string; dealId: string }> => {
    return apiClient.post<{ message: string; dealId: string }>(
      `/leads/${leadId}/convert`,
      dealData,
    );
  },

  addLeadNote: async (
    leadId: string,
    note: string,
  ): Promise<{ message: string; noteId: string }> => {
    return apiClient.post<{ message: string; noteId: string }>(
      `/leads/${leadId}/notes`,
      { note },
    );
  },

  getLeadActivity: async (leadId: string): Promise<LeadActivity[]> => {
    return apiClient.get<LeadActivity[]>(`/leads/${leadId}/activity`);
  },
};

export default leadService;
