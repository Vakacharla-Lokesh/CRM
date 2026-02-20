import { get } from './core';

export const analyticsAPI = {
  dashboard: (params?: {
    organizationId?: string;
    startDate?: string;
    endDate?: string;
  }) => get("/analytics/dashboard", params),

  leadTrends: (params?: Record<string, unknown>) => 
    get("/analytics/leads/trends", params),

  leadStatusBreakdown: (params?: Record<string, unknown>) =>
    get("/analytics/leads/status-breakdown", params),

  dealPipeline: (params?: Record<string, unknown>) => 
    get("/analytics/deals/pipeline", params),

  organizationStats: (params?: Record<string, unknown>) =>
    get("/analytics/organizations/stats", params),

  campaignPerformance: (params?: Record<string, unknown>) =>
    get("/analytics/campaigns/performance", params),
};
