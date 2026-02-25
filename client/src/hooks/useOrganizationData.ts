import { useState, useCallback, useMemo } from "react";
import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { organizationService } from "@/services";
import { useIndexedDB } from "./useIndexedDB";
import type { Organization } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrganizationFilters {
  industry: string;
  search: string;
  dateFrom: string;
  dateTo: string;
}

interface OrganizationStatistics {
  total: number;
  byIndustry: Record<string, number>;
}

const PAGE_LIMIT = 20;

const EMPTY_FILTERS: OrganizationFilters = {
  industry: "",
  search: "",
  dateFrom: "",
  dateTo: "",
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useOrganizationData = () => {
  const queryClient = useQueryClient();
  const { updateItem, deleteItem, getAll } = useIndexedDB<
    Organization & { id: string }
  >("organizations");

  // Local UI state
  const [filters, setFilters] = useState<OrganizationFilters>(EMPTY_FILTERS);
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
    queryKey: ["organizations"],
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      // Offline fallback — serve IndexedDB cache
      if (!navigator.onLine) {
        const cached = await getAll();
        return {
          organizations: cached as unknown as Organization[],
          nextCursor: null,
          hasNextPage: false,
        };
      }

      const page = await organizationService.getAllOrganizations({
        cursor: pageParam ?? undefined,
        limit: PAGE_LIMIT,
      });

      // Write-through to IndexedDB after every successful page
      for (const org of page.organizations) {
        try {
          await updateItem(org._id, { ...org, id: org._id });
        } catch (e) {
          console.warn("Failed to cache organization in IndexedDB:", e);
        }
      }

      return page;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
  });

  // ─── Search query ──────────────────────────────────────────────────────────
  // organizationService.searchOrganizations returns Organization[] directly.

  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ["organizations", "search", searchQuery],
    queryFn: () => organizationService.searchOrganizations(searchQuery.trim()),
    enabled: isSearchMode && searchQuery.trim().length > 0,
  });

  // ─── Derived state ─────────────────────────────────────────────────────────

  const allOrganizations: Organization[] = useMemo(
    () => data?.pages.flatMap((page) => page.organizations) ?? [],
    [data],
  );

  // Statistics — computed from all loaded organizations (not filtered).
  const statistics: OrganizationStatistics = useMemo(() => {
    const byIndustry: Record<string, number> = {};

    allOrganizations.forEach((org) => {
      if (org.organizationIndustry) {
        byIndustry[org.organizationIndustry] =
          (byIndustry[org.organizationIndustry] ?? 0) + 1;
      }
    });

    return { total: allOrganizations.length, byIndustry };
  }, [allOrganizations]);

  // Client-side filtering — in search mode use search results directly.
  const filteredOrganizations: Organization[] = useMemo(() => {
    if (isSearchMode) return searchResults;

    return allOrganizations.filter((org) => {
      if (filters.industry) {
        if (
          org.organizationIndustry?.toLowerCase() !==
          filters.industry.toLowerCase()
        )
          return false;
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matches =
          org.organizationName?.toLowerCase().includes(searchLower) ||
          org.organizationWebsite?.toLowerCase().includes(searchLower) ||
          org.organizationIndustry?.toLowerCase().includes(searchLower);
        if (!matches) return false;
      }

      if (filters.dateFrom) {
        const fromTime = new Date(filters.dateFrom).getTime();
        if (new Date(org.createdAt ?? "").getTime() < fromTime) return false;
      }

      if (filters.dateTo) {
        const toTime = new Date(filters.dateTo).getTime();
        if (new Date(org.createdAt ?? "").getTime() > toTime) return false;
      }

      return true;
    });
  }, [allOrganizations, filters, isSearchMode, searchResults]);

  // totalPages — preserved from original hook (used by some components).
  const totalPages = useMemo(
    () => Math.ceil(filteredOrganizations.length / PAGE_LIMIT),
    [filteredOrganizations],
  );

  // ─── Mutations ─────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: (organizationData: Partial<Organization>) =>
      organizationService.createOrganization(organizationData),
    onSuccess: (newOrg) => {
      // Write-through on create
      updateItem(newOrg._id, { ...newOrg, id: newOrg._id }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Organization>;
    }) => organizationService.updateOrganization(id, updates),
    onSuccess: (updatedOrg) => {
      updateItem(updatedOrg._id, {
        ...updatedOrg,
        id: updatedOrg._id,
      }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => organizationService.deleteOrganization(id),
    onSuccess: (_, id) => {
      // deleteItem preserves the IndexedDB sync that the original hook had
      deleteItem(id).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: ({
      ids,
      updates,
    }: {
      ids: string[];
      updates: Partial<Organization>;
    }) => organizationService.bulkUpdateOrganizations(ids, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) =>
      organizationService.bulkDeleteOrganizations(ids),
    onSuccess: (_, ids) => {
      // Clean up IndexedDB for each deleted org
      ids.forEach((id) => deleteItem(id).catch(() => {}));
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  // ─── Stable callbacks ──────────────────────────────────────────────────────

  // fetchOrganizations is called explicitly by organizationsPage (on mount)
  // and by leadModal (when it opens). Both share the same cache — TanStack
  // deduplicates the request so only one network call fires.
  const fetchOrganizations = useCallback(() => {
    refetch();
  }, [refetch]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !loadingMore) {
      fetchNextPage();
    }
  }, [hasNextPage, loadingMore, fetchNextPage]);

  const fetchOrganizationById = useCallback(async (id: string) => {
    return organizationService.getOrganizationById(id);
  }, []);

  const createOrganization = useCallback(
    async (organizationData: Partial<Organization>) => {
      return createMutation.mutateAsync(organizationData);
    },
    [createMutation],
  );

  const updateOrganization = useCallback(
    async (id: string, updates: Partial<Organization>) => {
      return updateMutation.mutateAsync({ id, updates });
    },
    [updateMutation],
  );

  const deleteOrganization = useCallback(
    async (id: string) => {
      return deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  const bulkUpdateOrganizations = useCallback(
    async (ids: string[], updates: Partial<Organization>) => {
      return bulkUpdateMutation.mutateAsync({ ids, updates });
    },
    [bulkUpdateMutation],
  );

  const bulkDeleteOrganizations = useCallback(
    async (ids: string[]) => {
      return bulkDeleteMutation.mutateAsync(ids);
    },
    [bulkDeleteMutation],
  );

  const searchOrganizations = useCallback(async (query: string) => {
    if (!query || query.trim() === "") {
      setIsSearchMode(false);
      setSearchQuery("");
      return;
    }
    setIsSearchMode(true);
    setSearchQuery(query);
  }, []);

  const updateFilter = useCallback(
    (key: keyof OrganizationFilters, value: unknown) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setIsSearchMode(false);
    setSearchQuery("");
  }, []);

  // ─── Return ────────────────────────────────────────────────────────────────
  // Shape is IDENTICAL to the old hook — no component changes required.

  return {
    // Data
    organizations: allOrganizations,
    filteredOrganizations,
    statistics,
    filters,
    loading,
    error: queryError instanceof Error ? queryError : null,
    totalPages,

    // Methods
    fetchOrganizations,
    fetchOrganizationById,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    searchOrganizations,
    bulkUpdateOrganizations,
    bulkDeleteOrganizations,
    isSearchMode,
    searchLoading,

    // Filter methods
    updateFilter,
    resetFilters,

    // Pagination
    nextCursor: data?.pages.at(-1)?.nextCursor ?? null,
    hasNextPage: hasNextPage ?? false,
    loadingMore,
    loadMore,
  };
};
