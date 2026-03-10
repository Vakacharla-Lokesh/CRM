import { apiClient } from "./api";

export interface CampaignPayload {
  subject: string;
  body: string;
  leadIds: string[];
}

export interface Campaign {
  _id: string;
  subject: string;
  status: string;
  totalRecipients: number;
  sentCount: number;
  openCount: number;
  createdAt: string;
}

export type TemplateCategory =
  | "Onboarding"
  | "Announcement"
  | "Follow-Up"
  | "Launch"
  | "Custom";

export interface CampaignTemplate {
  _id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  subject: string;
  body: string;
  usageCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplatePayload {
  name: string;
  description?: string;
  category?: TemplateCategory;
  subject: string;
  body: string;
}

const campaignService = {
  // Campaigns
  createCampaign: async (data: CampaignPayload) => {
    return apiClient.post<{
      message: string;
      campaignId: string;
      total: number;
    }>("/campaigns", data);
  },

  getCampaigns: async (): Promise<Campaign[]> => {
    const res = await apiClient.get<{ campaigns: Campaign[] }>("/campaigns");
    return res.campaigns;
  },

  getCampaignById: async (id: string): Promise<Campaign> => {
    const res = await apiClient.get<{ campaign: Campaign }>(`/campaigns/${id}`);
    return res.campaign;
  },

  // Templates
  getTemplates: async (): Promise<CampaignTemplate[]> => {
    const res = await apiClient.get<{ templates: CampaignTemplate[] }>(
      "/campaigns/templates",
    );
    return res.templates;
  },

  createTemplate: async (data: TemplatePayload): Promise<CampaignTemplate> => {
    const res = await apiClient.post<{ template: CampaignTemplate }>(
      "/campaigns/templates",
      data,
    );
    return res.template;
  },

  updateTemplate: async (
    id: string,
    data: Partial<TemplatePayload>,
  ): Promise<CampaignTemplate> => {
    const res = await apiClient.patch<{ template: CampaignTemplate }>(
      `/campaigns/templates/${id}`,
      data,
    );
    return res.template;
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await apiClient.delete(`/campaigns/templates/${id}`);
  },

  incrementTemplateUsage: async (id: string): Promise<void> => {
    await apiClient.post(`/campaigns/templates/${id}/use`, {});
  },
};

export default campaignService;
