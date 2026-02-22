import { apiClient } from "./api";
import type { Lead, Deal } from "../types";

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

export interface CursorLeadPage {
  leads: Lead[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

const leadService = {
  getAllLeads: async (params?: {
    cursor?: string | null;
    limit?: number;
  }): Promise<CursorLeadPage> => {
    const queryParams: Record<string, unknown> = {
      limit: params?.limit ?? 20,
    };
    if (params?.cursor) queryParams.cursor = params.cursor;

    const response = await apiClient.get<{
      count: number;
      leads: Lead[];
      nextCursor: string | null;
      hasNextPage: boolean;
    }>("/leads", queryParams);

    return {
      leads: response.leads,
      nextCursor: response.nextCursor,
      hasNextPage: response.hasNextPage,
    };
  },

  getLeadById: async (id: string): Promise<Lead> => {
    const response = await apiClient.get<{ lead: Lead }>(`/leads/${id}`);
    return response.lead;
  },

  createLead: async (leadData: Partial<Lead>): Promise<Lead> => {
    const response = await apiClient.post<{ message: string; lead: Lead }>(
      "/leads",
      leadData,
    );
    return response.lead;
  },

  updateLead: async (id: string, updates: Partial<Lead>): Promise<Lead> => {
    const response = await apiClient.put<{ message: string; lead: Lead }>(
      `/leads/${id}`,
      updates,
    );
    return response.lead;
  },

  deleteLead: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/leads/${id}`);
  },

  getLeadStats: async (): Promise<LeadStats> => {
    return apiClient.get<LeadStats>("/leads/stats");
  },

  convertLead: async (
    leadId: string,
    dealData?: { dealValue?: number; dealStatus?: string },
  ): Promise<{ message: string; deal: Deal; lead: Lead }> => {
    return apiClient.post<{ message: string; deal: Deal; lead: Lead }>(
      `/leads/${leadId}/convert`,
      dealData || {},
    );
  },

  getLeadActivity: async (leadId: string): Promise<LeadActivity[]> => {
    return apiClient.get<LeadActivity[]>(`/leads/${leadId}/activity`);
  },
};

export default leadService;
