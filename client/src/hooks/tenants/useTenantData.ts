import { useState, useCallback, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useIndexedDB } from "@/hooks";
import tenantService from "@/services/tenantService";
import type { Tenant, CreateTenantDto, UpdateTenantDto } from "@/types/tenant";

const PAGE_LIMIT = 20;

export interface TenantFilters {
  search: string;
  dateFrom: string;
  dateTo: string;
}

interface TenantStatistics {
  total: number;
}

export const useTenantData = () => {
  const queryClient = useQueryClient();
  const { updateItem, deleteItem, getAll } = useIndexedDB<
    Tenant & { id: string }
  >("tenants");

  const [allTenants, setAllTenants] = useState<Tenant[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [filters, setFilters] = useState<TenantFilters>({
    search: "",
    dateFrom: "",
    dateTo: "",
  });

  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: queryData,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["tenants", { search: filters.search }],
    queryFn: async () => {
      if (!navigator.onLine) {
        const cached = await getAll();
        return {
          tenants: cached as unknown as Tenant[],
          nextCursor: null,
          hasNextPage: false,
        };
      }
      const page = await tenantService.getAllTenants({
        limit: PAGE_LIMIT,
        search: filters.search || undefined,
      });
      return page;
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!queryData) return;
    const { tenants, nextCursor: cursor, hasNextPage: more } = queryData;

    setAllTenants(tenants);
    setNextCursor(cursor ?? null);
    setHasNextPage(more ?? false);

    tenants.forEach((tenant) => {
      updateItem(tenant._id, { ...tenant, id: tenant._id }).catch((err) =>
        console.error("Error storing tenant in IndexedDB:", err),
      );
    });
  }, [queryData, updateItem]);

  const error = queryError instanceof Error ? queryError : null;

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ["tenants", "search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return { tenants: [], count: 0 };
      const result = await tenantService.searchTenants({
        q: searchQuery.trim(),
        limit: 25,
      });
      return result;
    },
    enabled: isSearchMode && searchQuery.trim().length > 0,
    staleTime: 30_000,
  });

  const statistics: TenantStatistics = useMemo(
    () => ({
      total: allTenants.length,
    }),
    [allTenants],
  );

  const filteredTenants = useMemo(() => {
    if (isSearchMode) {
      return searchData?.tenants || [];
    }

    return allTenants.filter((tenant) => {
      // search is now filtered server-side

      if (filters.dateFrom || filters.dateTo) {
        const tenantDate = tenant.createdAt
          ? new Date(tenant.createdAt)
          : new Date();

        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          if (tenantDate < fromDate) return false;
        }

        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (tenantDate > toDate) return false;
        }
      }

      return true;
    });
  }, [allTenants, filters, isSearchMode, searchData]);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || loadingMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const page = await tenantService.getAllTenants({
        cursor: nextCursor,
        limit: PAGE_LIMIT,
        search: filters.search || undefined,
      });
      setAllTenants((prev) => [...prev, ...page.tenants]);
      setNextCursor(page.nextCursor ?? null);
      setHasNextPage(page.hasNextPage ?? false);
      for (const tenant of page.tenants) {
        await updateItem(tenant._id, { ...tenant, id: tenant._id });
      }
    } catch (err) {
      console.error("Error loading more tenants:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [hasNextPage, loadingMore, nextCursor, updateItem]);

  const createMutation = useMutation({
    mutationFn: (tenantData: CreateTenantDto) =>
      tenantService.createTenant(tenantData),
    onSuccess: async (newTenant) => {
      setAllTenants((prev) => [...prev, newTenant]);
      await updateItem(newTenant._id, {
        ...newTenant,
        id: newTenant._id,
      }).catch((err) =>
        console.error("Error storing new tenant in IndexedDB:", err),
      );
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      tenantId,
      tenantData,
      lastKnownUpdatedAt,
    }: {
      tenantId: string;
      tenantData: UpdateTenantDto;
      lastKnownUpdatedAt?: Date;
    }) => tenantService.updateTenant(tenantId, tenantData, lastKnownUpdatedAt),
    onSuccess: async (updatedTenant) => {
      setAllTenants((prev) =>
        prev.map((t) => (t._id === updatedTenant._id ? updatedTenant : t)),
      );
      await updateItem(updatedTenant._id, {
        ...updatedTenant,
        id: updatedTenant._id,
      }).catch((err) =>
        console.error("Error updating tenant in IndexedDB:", err),
      );
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
    onError: (err: unknown) => {
      const status = (err as { status?: number }).status;
      if (status === 409) {
        toast.error("This tenant was modified by someone else. Please refresh and try again.");
        queryClient.invalidateQueries({ queryKey: ["tenants"] });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (tenantId: string) => tenantService.deleteTenant(tenantId),
    onSuccess: async (_, tenantId) => {
      setAllTenants((prev) => prev.filter((t) => t._id !== tenantId));
      await deleteItem(tenantId).catch((err) =>
        console.error("Error deleting tenant from IndexedDB:", err),
      );
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });

  const createTenant = useCallback(
    (tenantData: CreateTenantDto) => createMutation.mutateAsync(tenantData),
    [createMutation],
  );

  const updateTenant = useCallback(
    (tenantId: string, tenantData: UpdateTenantDto) => {
      const cachedTenant = allTenants.find((t) => t._id === tenantId);
      return updateMutation.mutateAsync({
        tenantId,
        tenantData,
        lastKnownUpdatedAt: cachedTenant?.updatedAt ? new Date(cachedTenant.updatedAt) : undefined,
      });
    },
    [updateMutation, allTenants],
  );

  const deleteTenant = useCallback(
    (tenantId: string) => deleteMutation.mutateAsync(tenantId),
    [deleteMutation],
  );

  const updateFilter = useCallback(
    <K extends keyof TenantFilters>(key: K, value: TenantFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setFilters({ search: "", dateFrom: "", dateTo: "" });
    setIsSearchMode(false);
    setSearchQuery("");
  }, []);

  const searchTenants = useCallback(
    async (query: string, currentFilters?: TenantFilters) => {
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

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["tenants"] });
  }, [queryClient]);

  return {
    // Data
    tenants: allTenants,
    filteredTenants,
    statistics,

    // State
    loading,
    error,

    // Filters
    filters,
    updateFilter,
    clearFilters,

    // Search
    searchTenants,
    isSearchMode,
    searchLoading,

    // CRUD
    createTenant,
    updateTenant,
    deleteTenant,

    // Additional operations
    refresh,

    // Pagination
    nextCursor,
    hasNextPage,
    loadingMore,
    loadMore,
  };
};

export default useTenantData;
