export type CampaignStatus = "draft" | "scheduled" | "active" | "paused" | "completed" | "cancelled";

export type CampaignType = "email" | "sms" | "social" | "phone" | "event" | "other";

export interface Campaign {
  _id: string;
  campaignId?: string;
  tenantId: string;
  userId: string;
  name: string;
  description?: string;
  type: CampaignType;
  status: CampaignStatus;
  startDate?: Date;
  endDate?: Date;
  targetAudience?: string;
  budget?: number;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCampaignDTO {
  name: string;
  description?: string;
  type: CampaignType;
  status?: CampaignStatus;
  startDate?: Date;
  endDate?: Date;
  targetAudience?: string;
  budget?: number;
  organizationId?: string;
}

export interface UpdateCampaignDTO {
  name?: string;
  description?: string;
  type?: CampaignType;
  status?: CampaignStatus;
  startDate?: Date;
  endDate?: Date;
  targetAudience?: string;
  budget?: number;
  organizationId?: string;
}

export interface CampaignListResponse {
  campaigns: Campaign[];
  total: number;
  page: number;
  limit: number;
}

export function isCampaign(obj: unknown): obj is Campaign {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as Campaign)._id === "string" &&
    typeof (obj as Campaign).name === "string" &&
    typeof (obj as Campaign).type === "string" &&
    typeof (obj as Campaign).status === "string"
  );
}
