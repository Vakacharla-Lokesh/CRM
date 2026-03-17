import { useQuery } from "@tanstack/react-query";
import { leadActivitiesAPI } from "@/services/api/";
import type { LeadActivity } from "@/types";

export const useLeadActivityData = (leadId: string, enabled: boolean = true) => {
  const queryKey = ["leadActivities", leadId];

  const {
    data,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => leadActivitiesAPI.getByLead(leadId),
    enabled: !!leadId && enabled,
    staleTime: 30_000,
  });

  const activities: LeadActivity[] = data ?? [];
  const error = queryError instanceof Error ? queryError.message : null;

  return {
    activities,
    loading,
    error,
    refetch,
  };
};
