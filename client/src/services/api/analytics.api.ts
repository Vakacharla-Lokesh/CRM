import { get } from "./core";

export interface DashboardStats {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  activeCampaigns: number;
  revenue: number;
  totalDeals: number;
  openDeals: number;
  totalOrganizations: number;
}

export interface DashboardChanges {
  leadsChange: number;
  conversionRateChange: number;
  revenueChange: number;
  campaignsChange: number;
}

export interface DashboardPeriod {
  days: number;
  currentStart: string;
  currentEnd: string;
  previousStart: string;
  previousEnd: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  changes: DashboardChanges;
  period: DashboardPeriod;
}

export interface LeadTrendStatusEntry {
  status: string;
  count: number;
}

export interface LeadTrendDay {
  date: string; // "YYYY-MM-DD"
  total: number;
  byStatus: LeadTrendStatusEntry[];
}

export interface LeadTrendsResponse {
  trends: LeadTrendDay[];
  days: number;
}

export interface LeadStatusEntry {
  status: string;
  count: number;
  avgScore: number;
  percentage: number;
}

export interface LeadStatusBreakdownResponse {
  breakdown: LeadStatusEntry[];
  total: number;
  days: number;
}

export interface ScoreBucket {
  range: string; // "0-19" | "20-39" | "40-59" | "60-79" | "80-100"
  count: number;
  convertedCount: number;
}

export interface LeadScoreDistributionResponse {
  distribution: ScoreBucket[];
}

export interface DealPipelineStage {
  stage: string;
  count: number;
  totalValue: number;
  avgValue: number;
  percentage: number;
}

export interface DealPipelineMonthlyTrend {
  year: number;
  month: number;
  count: number;
  totalValue: number;
}

export interface DealPipelineSummary {
  totalPipelineValue: number;
  totalDeals: number;
  avgDealValue: number;
}

export interface DealPipelineResponse {
  pipeline: DealPipelineStage[];
  trends: DealPipelineMonthlyTrend[];
  summary: DealPipelineSummary;
}

export interface DealTrendStatusEntry {
  status: string;
  count: number;
  value: number;
}

export interface DealTrendDay {
  date: string;
  totalDeals: number;
  totalValue: number;
  byStatus: DealTrendStatusEntry[];
}

export interface DealTrendsResponse {
  trends: DealTrendDay[];
  days: number;
}

export interface OrgIndustryStat {
  industry: string;
  organizationCount: number;
  totalSize: number;
  avgSize: number;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
}

export interface OrganizationStatsResponse {
  stats: OrgIndustryStat[];
}

export interface TopOrganization {
  _id: string;
  organizationName: string;
  organizationIndustry: string;
  organizationSize: number;
  totalLeads: number;
  convertedLeads: number;
  totalDeals: number;
  totalDealValue: number;
  wonDealValue: number;
}

export interface TopOrganizationsResponse {
  organizations: TopOrganization[];
}

export const analyticsAPI = {
  /** GET /analytics/dashboard */
  dashboard: () => get<DashboardResponse>("/analytics/dashboard"),

  /** GET /analytics/leads/trends?days=N */
  leadTrends: (params?: { days?: number }) =>
    get<LeadTrendsResponse>("/analytics/leads/trends", params),

  /** GET /analytics/leads/status-breakdown?days=N */
  leadStatusBreakdown: (params?: { days?: number }) =>
    get<LeadStatusBreakdownResponse>(
      "/analytics/leads/status-breakdown",
      params,
    ),

  /** GET /analytics/leads/score-distribution */
  leadScoreDistribution: () =>
    get<LeadScoreDistributionResponse>("/analytics/leads/score-distribution"),

  /** GET /analytics/deals/pipeline */
  dealPipeline: () => get<DealPipelineResponse>("/analytics/deals/pipeline"),

  /** GET /analytics/deals/trends?days=N */
  dealTrends: (params?: { days?: number }) =>
    get<DealTrendsResponse>("/analytics/deals/trends", params),

  /** GET /analytics/organizations/stats */
  organizationStats: () =>
    get<OrganizationStatsResponse>("/analytics/organizations/stats"),

  /** GET /analytics/organizations/top?limit=N */
  topOrganizations: (params?: { limit?: number }) =>
    get<TopOrganizationsResponse>("/analytics/organizations/top", params),
};
