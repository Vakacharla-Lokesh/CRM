import { get } from "./core";

export interface UsersStatsResponse {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminsCount: number;
}

export interface TenantsStatsResponse {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
}

export const statsAPI = {
  getUsersStats: (params?: { role?: string; status?: string }) =>
    get<UsersStatsResponse>("/stats/users", params),

  getTenantsStats: () =>
    get<TenantsStatsResponse>("/stats/tenants"),
};
