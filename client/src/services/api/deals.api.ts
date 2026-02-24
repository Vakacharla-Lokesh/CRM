import { get, post, put, delete_ } from "./core";
import type {
  Deal,
  DealListResponse,
  CreateDealDTO,
  UpdateDealDTO,
} from "../../types";

export const dealsAPI = {
  list: async (params?: {
    page?: number;
    limit?: number;
    stage?: string;
    organizationId?: string;
    ownerId?: string;
  }) => {
    const response = await get<{ count: number; deals: Deal[] }>("/deals", params);
    return {
      deals: response.deals,
      total: response.count,
      page: params?.page || 1,
      limit: params?.limit || response.count,
    } as DealListResponse;
  },

  get: async (id: string) => {
    const response = await get<{ deal: Deal }>(`/deals/${id}`);
    return response.deal;
  },

  create: async (data: CreateDealDTO) => {
    const response = await post<{ message: string; deal: Deal }>("/deals", data);
    return response.deal;
  },

  update: async (id: string, data: UpdateDealDTO) => {
    const response = await put<{ message: string; deal: Deal }>(`/deals/${id}`, data);
    return response.deal;
  },

  delete: (id: string) => delete_<void>(`/deals/${id}`),

  addLead: (dealId: string, leadId: string) =>
    post(`/deals/${dealId}/leads`, { leadId }),

  removeLead: (dealId: string, leadId: string) =>
    delete_(`/deals/${dealId}/leads/${leadId}`),

  getMetrics: (params?: { organizationId?: string; ownerId?: string }) =>
    get("/deals/metrics", params),
};
