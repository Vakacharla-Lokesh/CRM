import { useQuery } from "@tanstack/react-query";
import { useAppContext } from "@/hooks/useAppContext";
import { statsAPI } from "@/services/api/stats.api";
import type { UsersStatsResponse } from "@/services/api/stats.api";

interface UsersStatsFilters {
  role?: string;
  status?: string;
}

export const useUsersStats = (filters?: UsersStatsFilters) => {
  const { user } = useAppContext();
  const params = {
    role: filters?.role || undefined,
    status: filters?.status || undefined,
  };

  return useQuery<UsersStatsResponse>({
    queryKey: ["users-stats", params.role, params.status],
    queryFn: () => statsAPI.getUsersStats(params),
    enabled: !!user,
    staleTime: 30_000,
    retry: 1,
  });
};
