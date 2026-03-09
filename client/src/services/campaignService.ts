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

const campaignService = {
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
};

export default campaignService;
