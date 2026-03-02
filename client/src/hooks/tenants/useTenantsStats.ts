import { useQuery } from "@tanstack/react-query";
import { useAppContext } from "@/hooks/useAppContext";
import { statsAPI } from "@/services/api/stats.api";
import type { TenantsStatsResponse } from "@/services/api/stats.api";

export const useTenantsStats = () => {
  const { user } = useAppContext();

  return useQuery<TenantsStatsResponse>({
    queryKey: ["tenants-stats"],
    queryFn: () => statsAPI.getTenantsStats(),
    enabled: !!user,
    staleTime: 30_000,
    retry: 1,
  });
};
