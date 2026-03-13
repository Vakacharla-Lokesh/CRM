import { useState, useCallback, useMemo } from "react";
import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { organizationService } from "@/services";
import { useIndexedDB } from "@/hooks/useIndexedDB";
import type { Organization } from "@/types";

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

export const useOrganizationData = () => {
  const queryClient = useQueryClient();
  const { updateItem, deleteItem, getAll } = useIndexedDB<
    Organization & { id: string }
  >("organizations");

  const [filters, setFilters] = useState<OrganizationFilters>(EMPTY_FILTERS);
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
    queryKey: ["organizations", { industry: filters.industry }],
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
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
        industry: filters.industry || undefined,
      });

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

  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ["organizations", "search", searchQuery],
    queryFn: () => organizationService.searchOrganizations(searchQuery.trim()),
    enabled: isSearchMode && searchQuery.trim().length > 0,
  });

  const allOrganizations: Organization[] = useMemo(
    () => data?.pages.flatMap((page) => page.organizations) ?? [],
    [data],
  );

  const statistics: OrganizationStatistics = useMemo(() => {
    const byIndustry: Record<string, number> = {};

    allOrganizations.forEach((org) => {
      if (org.industry) {
        byIndustry[org.industry] = (byIndustry[org.industry] ?? 0) + 1;
      }
    });

    return { total: allOrganizations.length, byIndustry };
  }, [allOrganizations]);

  const filteredOrganizations: Organization[] = useMemo(() => {
    if (isSearchMode) return searchResults;

    return allOrganizations.filter((org) => {
      // industry is now filtered server-side

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matches =
          org.name?.toLowerCase().includes(searchLower) ||
          org.website?.toLowerCase().includes(searchLower) ||
          org.industry?.toLowerCase().includes(searchLower);
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

  const totalPages = useMemo(
    () => Math.ceil(filteredOrganizations.length / PAGE_LIMIT),
    [filteredOrganizations],
  );

  const createMutation = useMutation({
    mutationFn: (organizationData: Partial<Organization>) =>
      organizationService.createOrganization(organizationData),
    onSuccess: (newOrg) => {
      updateItem(newOrg._id, { ...newOrg, id: newOrg._id }).catch(() => {});
      // invalidation is handled at the call site after modal closes
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
      lastKnownUpdatedAt,
    }: {
      id: string;
      updates: Partial<Organization>;
      lastKnownUpdatedAt?: Date;
    }) =>
      organizationService.updateOrganization(id, updates, lastKnownUpdatedAt),
    onSuccess: (updatedOrg) => {
      updateItem(updatedOrg._id, {
        ...updatedOrg,
        id: updatedOrg._id,
      }).catch(() => {});
      // invalidation is handled at the call site after modal closes
    },
    onError: (err: unknown) => {
      const status = (err as { status?: number }).status;
      if (status === 409) {
        toast.error(
          "This organization was modified by someone else. Please refresh and try again.",
        );
        queryClient.invalidateQueries({ queryKey: ["organizations"] });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => organizationService.deleteOrganization(id),
    onSuccess: (_, id) => {
      deleteItem(id).catch(() => {});
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
      ids.forEach((id) => deleteItem(id).catch(() => {}));
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

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
      const cachedOrg = allOrganizations.find((o) => o._id === id);
      return updateMutation.mutateAsync({
        id,
        updates,
        lastKnownUpdatedAt: cachedOrg?.updatedAt,
      });
    },
    [updateMutation, allOrganizations],
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
