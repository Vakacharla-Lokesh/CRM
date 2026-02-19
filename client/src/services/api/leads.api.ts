import { get, post, put, delete_ } from "./core";
import type {
  Lead,
  LeadListResponse,
  CreateLeadDTO,
  UpdateLeadDTO,
} from "../../types";

export const leadsAPI = {
  list: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    organizationId?: string;
    userId?: string;
    search?: string;
  }) => {
    const response = await get<{ count: number; leads: Lead[] }>("/leads", params);
    return {
      leads: response.leads,
      total: response.count,
      page: params?.page || 1,
      limit: params?.limit || response.count,
    } as LeadListResponse;
  },

  get: async (id: string) => {
    const response = await get<{ lead: Lead }>(`/leads/${id}`);
    return response.lead;
  },

  create: async (data: CreateLeadDTO) => {
    const response = await post<{ message: string; lead: Lead }>("/leads", data);
    return response.lead;
  },

  update: async (id: string, data: UpdateLeadDTO) => {
    const response = await put<{ message: string; lead: Lead }>(`/leads/${id}`, data);
    return response.lead;
  },

  delete: (id: string) => delete_<void>(`/leads/${id}`),

  bulkCreate: (leads: CreateLeadDTO[]) =>
    post<{ created: number; failed: number }>("/leads/bulk", { leads }),

  bulkUpdate: (updates: Array<{ id: string; data: UpdateLeadDTO }>) =>
    put<{ updated: number; failed: number }>("/leads/bulk", { updates }),

  assignToUser: (leadId: string, userId: string) =>
    put<Lead>(`/leads/${leadId}/assign`, { userId }),

  scoreLeads: (leadIds: string[]) => post<Lead[]>("/leads/score", { leadIds }),

  getActivity: (leadId: string, params?: { page?: number; limit?: number }) =>
    get(`/leads/${leadId}/activity`, params),
};
