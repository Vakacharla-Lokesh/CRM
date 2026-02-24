import { get, post, put, delete_ } from "./core";
import type {
  Campaign,
  CampaignListResponse,
  CreateCampaignDTO,
  UpdateCampaignDTO,
} from "../../types";

export const campaignsAPI = {
  list: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    organizationId?: string;
  }) => get<CampaignListResponse>("/campaigns", params),

  get: (id: string) => get<Campaign>(`/campaigns/${id}`),

  create: (data: CreateCampaignDTO) => post<Campaign>("/campaigns", data),

  update: (id: string, data: UpdateCampaignDTO) =>
    put<Campaign>(`/campaigns/${id}`, data),

  delete: (id: string) => delete_<void>(`/campaigns/${id}`),

  draft: {
    save: (draft: Partial<Campaign>) => post("/campaigns/draft", draft),

    load: () => get("/campaigns/draft", {}),

    clear: () => delete_("/campaigns/draft"),
  },

  getMetrics: (id: string) => get(`/campaigns/${id}/metrics`, {}),

  sendTest: (id: string, recipientEmails: string[]) =>
    post(`/campaigns/${id}/test`, { recipientEmails }),
};
