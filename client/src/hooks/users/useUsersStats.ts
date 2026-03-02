import { useQuery } from "@tanstack/react-query";
import { useAppContext } from "@/hooks/useAppContext";
import { statsAPI } from "@/services/api/stats.api";
import type { UsersStatsResponse } from "@/services/api/stats.api";

export const useUsersStats = () => {
  const { user } = useAppContext();

  return useQuery<UsersStatsResponse>({
    queryKey: ["users-stats"],
    queryFn: () => statsAPI.getUsersStats(),
    enabled: !!user,
    staleTime: 30_000,
    retry: 1,
  });
};
