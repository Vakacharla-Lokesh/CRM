import { useState, useCallback, useMemo } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import leadService from "../services/leadService";
import type { Lead } from "../types";
import { useIndexedDB } from "./useIndexedDB";
import { useOfflineMutation } from "./useOfllineMutation";

interface LeadFilters {
  search?: string;
  status?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface LeadStatistics {
  total: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  conversionRate: string;
}

const PAGE_LIMIT = 20;

export function useLeadData() {
  const queryClient = useQueryClient();
  const { updateItem, getAll } = useIndexedDB<Lead & { id: string }>("leads");

  const [filters, setFilters] = useState<LeadFilters>({});
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data,
    isLoading: loading,
    isFetchingNextPage: loadingMore,
    error: queryError,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["leads", { status: filters.status, source: filters.source }],
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      if (!navigator.onLine) {
        const cached = await getAll();
        return {
          leads: cached as unknown as Lead[],
          nextCursor: null,
          hasNextPage: false,
        };
      }

      const page = await leadService.getAllLeads({
        cursor: pageParam ?? undefined,
        limit: PAGE_LIMIT,
        status: filters.status || undefined,
        source: filters.source || undefined,
      });

      for (const lead of page.leads) {
        try {
          await updateItem(lead._id, { ...lead, id: lead._id });
        } catch (e) {
          console.warn("Failed to cache lead in IndexedDB:", e);
        }
      }

      return page;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
  });

  const { data: searchData, isLoading: searchLoading } = useInfiniteQuery({
    queryKey: ["leads", "search", searchQuery, filters.status, filters.source],
    queryFn: async () => {
      const result = await leadService.searchLeads({
        q: searchQuery.trim(),
        status: filters.status || undefined,
        source: filters.source || undefined,
      });
      return result;
    },
    initialPageParam: null as string | null,
    getNextPageParam: () => undefined,
    enabled: isSearchMode && searchQuery.trim().length > 0,
  });

  const allLeads: Lead[] = useMemo(
    () => data?.pages.flatMap((page) => page.leads) ?? [],
    [data],
  );

  const filteredLeads: Lead[] = useMemo(() => {
    if (isSearchMode) {
      return searchData?.pages.flatMap((p) => p.leads) ?? [];
    }

    let result = allLeads;

    // status and source are now filtered server-side

    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime();
      result = result.filter(
        (l) => new Date(l.createdAt ?? "").getTime() >= from,
      );
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo).getTime();
      result = result.filter(
        (l) => new Date(l.createdAt ?? "").getTime() <= to,
      );
    }

    return result;
  }, [allLeads, filters, isSearchMode, searchData]);

  const statistics: LeadStatistics = useMemo(() => {
    const byStatus: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    filteredLeads.forEach((lead) => {
      if (lead.leadStatus)
        byStatus[lead.leadStatus] = (byStatus[lead.leadStatus] ?? 0) + 1;
      if (lead.leadSource)
        bySource[lead.leadSource] = (bySource[lead.leadSource] ?? 0) + 1;
    });

    const converted = byStatus["Converted"] ?? 0;
    const conversionRate =
      filteredLeads.length > 0
        ? ((converted / filteredLeads.length) * 100).toFixed(1)
        : "0";

    return {
      total: filteredLeads.length,
      byStatus,
      bySource,
      conversionRate,
    };
  }, [filteredLeads]);

  const createMutation = useOfflineMutation({
    mutationKey: ["leads", "create"],
    mutationFn: (leadData: Partial<Lead>) => leadService.createLead(leadData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Lead> }) =>
      leadService.updateLead(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => leadService.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const fetchLeads = useCallback(() => {
    refetch();
  }, [refetch]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !loadingMore) {
      fetchNextPage();
    }
  }, [hasNextPage, loadingMore, fetchNextPage]);

  const createLead = useCallback(
    async (leadData: Partial<Lead>) => {
      return createMutation.mutateAsync(leadData);
    },
    [createMutation],
  );

  const updateLead = useCallback(
    async (id: string, updates: Partial<Lead>) => {
      return updateMutation.mutateAsync({ id, updates });
    },
    [updateMutation],
  );

  const deleteLead = useCallback(
    async (id: string) => {
      return deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  const fetchLeadById = useCallback(async (id: string) => {
    return leadService.getLeadById(id);
  }, []);

  const updateFilter = useCallback((key: keyof LeadFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setIsSearchMode(false);
    setSearchQuery("");
  }, []);

  const searchLeads = useCallback(
    async (query: string, currentFilters: LeadFilters) => {
      if (!query || query.trim() === "") {
        setIsSearchMode(false);
        setSearchQuery("");
        return;
      }
      if (currentFilters) {
        setFilters((prev) => ({ ...prev, ...currentFilters }));
      }
      setIsSearchMode(true);
      setSearchQuery(query);
    },
    [],
  );

  return {
    leads: allLeads,
    filteredLeads,
    loading,
    loadingMore,
    error: queryError instanceof Error ? queryError : null,
    statistics,
    filters,
    hasNextPage: hasNextPage ?? false,
    fetchLeads,
    loadMore,
    createLead,
    updateLead,
    deleteLead,
    fetchLeadById,
    updateFilter,
    resetFilters,
    searchLeads,
    isSearchMode,
    searchLoading,
  };
}
