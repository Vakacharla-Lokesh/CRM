import { get, post, put, delete_ } from "./core";
import type {
  Deal,
  DealListResponse,
  CreateDealDTO,
  UpdateDealDTO,
} from "../../types";

export const dealsAPI = {
  list: (params?: {
    page?: number;
    limit?: number;
    stage?: string;
    organizationId?: string;
    ownerId?: string;
  }) => get<DealListResponse>("/deals", params),

  get: (id: string) => get<Deal>(`/deals/${id}`),

  create: (data: CreateDealDTO) => post<Deal>("/deals", data),

  update: (id: string, data: UpdateDealDTO) => put<Deal>(`/deals/${id}`, data),

  delete: (id: string) => delete_<void>(`/deals/${id}`),

  addLead: (dealId: string, leadId: string) =>
    post(`/deals/${dealId}/leads`, { leadId }),

  removeLead: (dealId: string, leadId: string) =>
    delete_(`/deals/${dealId}/leads/${leadId}`),

  getMetrics: (params?: { organizationId?: string; ownerId?: string }) =>
    get("/deals/metrics", params),
};
