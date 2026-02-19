import { get } from './core';

export const analyticsAPI = {
  dashboard: (params?: {
    organizationId?: string;
    startDate?: string;
    endDate?: string;
  }) => get("/analytics/dashboard", params),

  leadTrends: (params?: Record<string, unknown>) => 
    get("/analytics/leads/trends", params),

  dealPipeline: (params?: Record<string, unknown>) => 
    get("/analytics/deals/pipeline", params),

  campaignPerformance: (params?: Record<string, unknown>) =>
    get("/analytics/campaigns/performance", params),
};
