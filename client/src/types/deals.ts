/**
 * Deal Model Types
 */

export interface Deal {
  _id: string;
  deal_id?: string; // Legacy backward compatibility
  dealName: string;
  dealValue: number;
  dealStage: DealStage;
  dealProbability: number; // 0-100
  dealClosureDate?: Date;
  dealDescription?: string;
  organizationId: string;
  leadIds: string[]; // Associated leads
  ownerId: string; // Assigned user
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDealDTO {
  dealName: string;
  dealValue: number;
  dealStage?: DealStage;
  dealProbability?: number;
  dealClosureDate?: Date;
  dealDescription?: string;
  organizationId: string;
  leadIds?: string[];
}

export interface UpdateDealDTO {
  dealName?: string;
  dealValue?: number;
  dealStage?: DealStage;
  dealProbability?: number;
  dealClosureDate?: Date;
  dealDescription?: string;
  leadIds?: string[];
  ownerId?: string;
}

export interface DealListResponse {
  deals: Deal[];
  total: number;
  page: number;
  limit: number;
}

export type DealStage =
  | "prospecting"
  | "qualification"
  | "proposal"
  | "negotiation"
  | "closed_won"
  | "closed_lost";

export interface DealMetrics {
  totalDeals: number;
  totalValue: number;
  avgValue: number;
  byStage: Record<DealStage, { count: number; value: number }>;
  forecastValue: number; // Sum of (value * probability / 100)
  conversionRate: number;
}

export function isDeal(obj: any): obj is Deal {
  return (
    obj &&
    typeof obj._id === "string" &&
    typeof obj.dealName === "string" &&
    typeof obj.dealValue === "number"
  );
}

function getStageColor(stage: DealStage): string {
  const colors: Record<DealStage, string> = {
    prospecting: "bg-blue-100 text-blue-800",
    qualification: "bg-cyan-100 text-cyan-800",
    proposal: "bg-purple-100 text-purple-800",
    negotiation: "bg-orange-100 text-orange-800",
    closed_won: "bg-green-100 text-green-800",
    closed_lost: "bg-red-100 text-red-800",
  };
  return colors[stage];
}

export interface DealWithMetadata extends Deal {
  stageColor: string;
  probabilityLabel: string;
  daysInStage: number;
}

export function enrichDeal(deal: Deal): DealWithMetadata {
  const stageColor = getStageColor(deal.dealStage);
  const probabilityLabel = getProbabilityLabel(deal.dealProbability);
  const daysInStage = Math.floor(
    (Date.now() - new Date(deal.updatedAt).getTime()) / (1000 * 60 * 60 * 24),
  );

  return {
    ...deal,
    stageColor,
    probabilityLabel,
    daysInStage,
  };
}

function getProbabilityLabel(probability: number): string {
  if (probability >= 75) return "High";
  if (probability >= 50) return "Medium";
  if (probability >= 25) return "Low";
  return "Very Low";
}

/**
 * Campaign Model Types
 */

export interface Campaign {
  _id: string;
  campaignName: string;
  campaignType: CampaignType;
  campaignStatus: CampaignStatus;
  campaignDescription?: string;
  targetAudience?: string[];
  budget?: number;
  startDate: Date;
  endDate?: Date;
  organizationId: string;
  createdBy: string; // User ID
  tenantId: string;
  metrics?: CampaignMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCampaignDTO {
  campaignName: string;
  campaignType: CampaignType;
  campaignStatus?: CampaignStatus;
  campaignDescription?: string;
  targetAudience?: string[];
  budget?: number;
  startDate: Date;
  endDate?: Date;
  organizationId: string;
}

export interface UpdateCampaignDTO {
  campaignName?: string;
  campaignType?: CampaignType;
  campaignStatus?: CampaignStatus;
  campaignDescription?: string;
  targetAudience?: string[];
  budget?: number;
  endDate?: Date;
}

export interface CampaignListResponse {
  campaigns: Campaign[];
  total: number;
  page: number;
  limit: number;
}

export type CampaignType =
  | "email"
  | "sms"
  | "social"
  | "webinar"
  | "event"
  | "content";
export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "paused"
  | "completed";

export interface CampaignMetrics {
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  bounced: number;
  unsubscribed: number;
  openRate: number; // percentage
  clickRate: number; // percentage
  conversionRate: number; // percentage
  roi?: number;
}

export interface CampaignDraft {
  _id?: string;
  campaignData: Partial<Campaign>;
  lastSaved: Date;
  isDirty: boolean;
}

export function isCampaign(obj: any): obj is Campaign {
  return (
    obj &&
    typeof obj._id === "string" &&
    typeof obj.campaignName === "string" &&
    typeof obj.campaignType === "string"
  );
}

function getStatusColor(status: CampaignStatus): string {
  const colors: Record<CampaignStatus, string> = {
    draft: "bg-gray-100 text-gray-800",
    scheduled: "bg-blue-100 text-blue-800",
    active: "bg-green-100 text-green-800",
    paused: "bg-yellow-100 text-yellow-800",
    completed: "bg-slate-100 text-slate-800",
  };
  return colors[status];
}

export interface CampaignWithMetadata extends Campaign {
  statusColor: string;
  daysActive: number;
  progressPercentage: number;
}

export function enrichCampaign(campaign: Campaign): CampaignWithMetadata {
  const statusColor = getStatusColor(campaign.campaignStatus);
  const daysActive = Math.floor(
    (Date.now() - new Date(campaign.startDate).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const endDate = campaign.endDate
    ? new Date(campaign.endDate).getTime()
    : Date.now();
  const startDate = new Date(campaign.startDate).getTime();
  const totalDuration = endDate - startDate;
  const elapsed = Date.now() - startDate;
  const progressPercentage =
    campaign.campaignStatus === "completed"
      ? 100
      : Math.min(100, Math.floor((elapsed / totalDuration) * 100));

  return {
    ...campaign,
    statusColor,
    daysActive,
    progressPercentage,
  };
}
