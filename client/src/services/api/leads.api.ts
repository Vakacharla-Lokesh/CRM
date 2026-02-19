import { get, post, put, delete_ } from "./core";
import type {
  Lead,
  LeadListResponse,
  CreateLeadDTO,
  UpdateLeadDTO,
} from "../../types";

export const leadsAPI = {
  list: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    organizationId?: string;
    userId?: string;
    search?: string;
  }) => get<LeadListResponse>("/leads", params),

  get: (id: string) => get<Lead>(`/leads/${id}`),

  create: (data: CreateLeadDTO) => post<Lead>("/leads", data),

  update: (id: string, data: UpdateLeadDTO) => put<Lead>(`/leads/${id}`, data),

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
