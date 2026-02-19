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
import { campaignsAPI } from "./campaigns.api";
import { bulkAPI } from "./bulk.api";
import { searchAPI } from "./search.api";
import { analyticsAPI } from "./analytics.api";

export {
  authAPI,
  leadsAPI,
  organizationsAPI,
  usersAPI,
  dealsAPI,
  campaignsAPI,
  bulkAPI,
  searchAPI,
  analyticsAPI,
};

export const API = {
  auth: authAPI,
  leads: leadsAPI,
  organizations: organizationsAPI,
  users: usersAPI,
  deals: dealsAPI,
  campaigns: campaignsAPI,
  bulk: bulkAPI,
  search: searchAPI,
  analytics: analyticsAPI,
};

export default API;
