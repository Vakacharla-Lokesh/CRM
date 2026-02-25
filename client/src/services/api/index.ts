export {
  apiClient,
  APIError,
  setToken,
  clearToken,
  getToken,
  API_BASE_URL,
} from "./core";

import { authAPI } from "./auth.api";
import { leadsAPI } from "./leads.api";
import { organizationsAPI } from "./organizations.api";
import { usersAPI } from "./users.api";
import { dealsAPI } from "./deals.api";
import { bulkAPI } from "./bulk.api";
import { searchAPI } from "./search.api";
import { analyticsAPI } from "./analytics.api";
import { callsAPI } from "./calls.api";
import { commentsAPI } from "./comments.api";
import { attachmentsAPI } from "./attachments.api";
import { exportAPI } from "./export.api";

export {
  authAPI,
  leadsAPI,
  organizationsAPI,
  usersAPI,
  dealsAPI,
  bulkAPI,
  searchAPI,
  analyticsAPI,
  callsAPI,
  commentsAPI,
  attachmentsAPI,
  exportAPI,
};

export const API = {
  auth: authAPI,
  leads: leadsAPI,
  organizations: organizationsAPI,
  calls: callsAPI,
  comments: commentsAPI,
  attachments: attachmentsAPI,
  users: usersAPI,
  deals: dealsAPI,
  bulk: bulkAPI,
  search: searchAPI,
  analytics: analyticsAPI,
  export: exportAPI,
};

export default API;

export type {
  DashboardStats,
  DashboardChanges,
  DashboardPeriod,
} from "./analytics.api";

export type {
  LeadTrendDay,
  LeadStatusEntry,
  ScoreBucket,
  DealPipelineStage,
  DealPipelineSummary,
  DealPipelineMonthlyTrend,
  OrgIndustryStat,
  TopOrganization,
} from "./analytics.api";
