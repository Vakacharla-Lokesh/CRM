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
  getUsersStats: () =>
    get<UsersStatsResponse>("/stats/users"),

  getTenantsStats: () =>
    get<TenantsStatsResponse>("/stats/tenants"),
};
