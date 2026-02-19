export {
  apiClient,
  APIError,
  setToken,
  clearToken,
  getToken,
  API_BASE_URL,
} from "./api/core";

export { authAPI } from "./api/auth.api";
export { leadsAPI } from "./api/leads.api";
export { organizationsAPI } from "./api/organizations.api";
export { usersAPI } from "./api/users.api";
export { dealsAPI } from "./api/deals.api";
export { campaignsAPI } from "./api/campaigns.api";
export { bulkAPI } from "./api/bulk.api";
export { searchAPI } from "./api/search.api";
export { analyticsAPI } from "./api/analytics.api";

export { API, API as default } from "./api/index";
