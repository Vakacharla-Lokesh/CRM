import { useState, useCallback, useMemo } from "react";
import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import dealService from "@/services/dealService";
import { useIndexedDB } from "./useIndexedDB";
import type { Deal, DealStatus, CreateDealDTO, UpdateDealDTO } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DealFilters {
  status: DealStatus | "";
  stage: DealStatus | "";
  search: string;
  dateFrom: string;
  dateTo: string;
  minValue: number | null;
  maxValue: number | null;
}

export interface DealStatistics {
  total: number;
  byStatus: Record<DealStatus, number>;
  byStage: Record<string, number>;
  totalValue: number;
  avgValue: number;
  forecastValue: number;
}

const PAGE_LIMIT = 20;

const EMPTY_FILTERS: DealFilters = {
  status: "",
  stage: "",
  search: "",
  dateFrom: "",
  dateTo: "",
  minValue: null,
  maxValue: null,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useDealData = () => {
  const queryClient = useQueryClient();
  const { updateItem, getAll } = useIndexedDB<Deal & { id: string }>("deals");

  // Local UI state — filters and search live here, not in TanStack cache
  const [filters, setFilters] = useState<DealFilters>(EMPTY_FILTERS);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ─── Main paginated query ──────────────────────────────────────────────────

  const {
    data,
    isLoading: loading,
    isFetchingNextPage: loadingMore,
    error: queryError,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["deals"],
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      // Offline fallback — serve IndexedDB cache
      if (!navigator.onLine) {
        const cached = await getAll();
        return {
          deals: cached as unknown as Deal[],
          nextCursor: null,
          hasNextPage: false,
        };
      }

      const page = await dealService.getAllDeals({
        cursor: pageParam ?? undefined,
        limit: PAGE_LIMIT,
      });

      // Write-through to IndexedDB after every successful page
      for (const deal of page.deals) {
        try {
          await updateItem(deal._id, { ...deal, id: deal._id });
        } catch (e) {
          console.warn("Failed to cache deal in IndexedDB:", e);
        }
      }

      return page;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
  });

  // ─── Search query ──────────────────────────────────────────────────────────
  // dealService.searchDeals returns Deal[] directly (not paginated).
  // Separate query key so it never conflicts with the main deals cache.

  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ["deals", "search", searchQuery],
    queryFn: () => dealService.searchDeals(searchQuery.trim()),
    enabled: isSearchMode && searchQuery.trim().length > 0,
  });

  // ─── Derived state ─────────────────────────────────────────────────────────

  const allDeals: Deal[] = useMemo(
    () => data?.pages.flatMap((page) => page.deals) ?? [],
    [data],
  );

  // Statistics — computed from all loaded deals (not filtered).
  // Preserves the pre-seeded byStatus keys from the original hook exactly.
  const statistics: DealStatistics = useMemo(() => {
    const total = allDeals.length;

    const byStatus: Record<DealStatus, number> = {
      Prospecting: 0,
      Qualification: 0,
      Negotiation: 0,
      "Ready to close": 0,
      Won: 0,
      Lost: 0,
    };

    const byStage: Record<string, number> = {
      prospecting: 0,
      qualification: 0,
      proposal: 0,
      negotiation: 0,
      closed_won: 0,
      closed_lost: 0,
    };

    let totalValue = 0;
    let forecastValue = 0;

    allDeals.forEach((deal) => {
      if (deal.dealStatus) {
        byStatus[deal.dealStatus] = (byStatus[deal.dealStatus] || 0) + 1;

        const stageKey = deal.dealStatus.toLowerCase().replace(/ /g, "_");
        if (stageKey === "won") {
          byStage.closed_won = (byStage.closed_won || 0) + 1;
        } else if (stageKey === "lost") {
          byStage.closed_lost = (byStage.closed_lost || 0) + 1;
        } else if (stageKey === "ready_to_close") {
          byStage.negotiation = (byStage.negotiation || 0) + 1;
        } else {
          byStage[stageKey] = (byStage[stageKey] || 0) + 1;
        }
      }

      totalValue += deal.dealValue || 0;

      if (deal.dealStatus !== "Won" && deal.dealStatus !== "Lost") {
        forecastValue += deal.dealValue || 0;
      }
    });

    const avgValue = total > 0 ? totalValue / total : 0;

    return { total, byStatus, byStage, totalValue, avgValue, forecastValue };
  }, [allDeals]);

  // Client-side filtering — in search mode use search results directly.
  const filteredDeals: Deal[] = useMemo(() => {
    if (isSearchMode) return searchResults;

    return allDeals.filter((deal) => {
      if (filters.status && deal.dealStatus !== filters.status) return false;
      if (filters.stage && deal.dealStatus !== filters.stage) return false;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matches =
          deal.dealName?.toLowerCase().includes(searchLower) ||
          deal.organizationId?.toString().includes(searchLower);
        if (!matches) return false;
      }

      const dealValue = deal.dealValue || 0;
      if (filters.minValue !== null && dealValue < filters.minValue)
        return false;
      if (filters.maxValue !== null && dealValue > filters.maxValue)
        return false;

      if (filters.dateFrom || filters.dateTo) {
        const dealDate = deal.createdAt ? new Date(deal.createdAt) : new Date();
        if (filters.dateFrom && dealDate < new Date(filters.dateFrom))
          return false;
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (dealDate > toDate) return false;
        }
      }

      return true;
    });
  }, [allDeals, filters, isSearchMode, searchResults]);

  // ─── Mutations ────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: (dealData: CreateDealDTO) => dealService.createDeal(dealData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      dealId,
      dealData,
    }: {
      dealId: string;
      dealData: UpdateDealDTO;
    }) => dealService.updateDeal(dealId, dealData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (dealId: string) => dealService.deleteDeal(dealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: ({
      dealIds,
      updateData,
    }: {
      dealIds: string[];
      updateData: UpdateDealDTO;
    }) => dealService.bulkUpdateDeals(dealIds, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (dealIds: string[]) => dealService.bulkDeleteDeals(dealIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });

  // ─── Stable callbacks ─────────────────────────────────────────────────────

  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !loadingMore) {
      fetchNextPage();
    }
  }, [hasNextPage, loadingMore, fetchNextPage]);

  const createDeal = useCallback(
    async (dealData: CreateDealDTO) => {
      return createMutation.mutateAsync(dealData);
    },
    [createMutation],
  );

  const updateDeal = useCallback(
    async (dealId: string, dealData: UpdateDealDTO) => {
      return updateMutation.mutateAsync({ dealId, dealData });
    },
    [updateMutation],
  );

  const deleteDeal = useCallback(
    async (dealId: string) => {
      return deleteMutation.mutateAsync(dealId);
    },
    [deleteMutation],
  );

  const bulkUpdateDeals = useCallback(
    async (dealIds: string[], updateData: UpdateDealDTO) => {
      return bulkUpdateMutation.mutateAsync({ dealIds, updateData });
    },
    [bulkUpdateMutation],
  );

  const bulkDeleteDeals = useCallback(
    async (dealIds: string[]) => {
      return bulkDeleteMutation.mutateAsync(dealIds);
    },
    [bulkDeleteMutation],
  );

  const searchDeals = useCallback(async (query: string) => {
    if (!query || query.trim() === "") {
      setIsSearchMode(false);
      setSearchQuery("");
      return;
    }
    setIsSearchMode(true);
    setSearchQuery(query);
  }, []);

  const updateFilter = useCallback(
    <K extends keyof DealFilters>(key: K, value: DealFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setIsSearchMode(false);
    setSearchQuery("");
  }, []);

  // ─── Return ───────────────────────────────────────────────────────────────
  // Shape is IDENTICAL to the old hook — no component changes required.

  return {
    deals: allDeals,
    filteredDeals,
    statistics,
    loading,
    error: queryError instanceof Error ? queryError : null,
    filters,
    updateFilter,
    clearFilters,
    createDeal,
    updateDeal,
    deleteDeal,
    bulkUpdateDeals,
    bulkDeleteDeals,
    refresh,
    nextCursor: data?.pages.at(-1)?.nextCursor ?? null,
    hasNextPage: hasNextPage ?? false,
    loadingMore,
    loadMore,
    searchDeals,
    isSearchMode,
    searchLoading,
  };
};

export default useDealData;
