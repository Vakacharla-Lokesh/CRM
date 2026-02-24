import { useState, useEffect, useCallback, useMemo } from "react";
import type { Organization } from "../types";
import { organizationService } from "../services";
import { useAsync } from "./useAsync";
import { useIndexedDB } from "./useIndexedDB";

interface Statistics {
  total: number;
  byIndustry: Record<string, number>;
}

interface Filters {
  industry: string;
  search: string;
  dateFrom: string;
  dateTo: string;
}

export const useOrganizationData = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filteredOrganizations, setFilteredOrganizations] = useState<
    Organization[]
  >([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    byIndustry: {},
  });
  const [filters, setFilters] = useState<Filters>({
    industry: "",
    search: "",
    dateFrom: "",
    dateTo: "",
  });

  const {
    execute: executeAsync,
    loading,
    error,
  } = useAsync<Organization | Organization[] | void>();
  const { updateItem, deleteItem, getAll } = useIndexedDB("organizations");

  const calculateStatistics = useCallback(
    (organizationsData: Organization[]) => {
      const stats: Statistics = {
        total: organizationsData.length,
        byIndustry: {},
      };

      organizationsData.forEach((org) => {
        stats.byIndustry[org.organizationIndustry] =
          (stats.byIndustry[org.organizationIndustry] ?? 0) + 1;
      });

      setStatistics(stats);
    },
    [],
  );

  const applyFilters = useCallback(() => {
    let filtered = [...organizations];

    // Filter by industry
    if (filters.industry) {
      filtered = filtered.filter(
        (org) =>
          org.organizationIndustry.toLowerCase() ===
          filters.industry.toLowerCase(),
      );
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (org) =>
          org.organizationName?.toLowerCase().includes(searchLower) ||
          org.organizationWebsite?.toLowerCase().includes(searchLower) ||
          org.organizationIndustry?.toLowerCase().includes(searchLower),
      );
    }

    // Filter by date range
    if (filters.dateFrom) {
      const fromTime = new Date(filters.dateFrom).getTime();
      filtered = filtered.filter(
        (org) => new Date(org.createdAt ?? "").getTime() >= fromTime,
      );
    }

    if (filters.dateTo) {
      const toTime = new Date(filters.dateTo).getTime();
      filtered = filtered.filter(
        (org) => new Date(org.createdAt ?? "").getTime() <= toTime,
      );
    }

    setFilteredOrganizations(filtered);
    calculateStatistics(filtered);
  }, [organizations, filters, calculateStatistics]);

  const fetchOrganizations = useCallback(async () => {
    return executeAsync(async () => {
      if (!navigator.onLine) {
        const cached = (await getAll()) as unknown as Organization[];
        setOrganizations(cached);
        setFilteredOrganizations(cached);
        calculateStatistics(cached);
        return cached;
      }

      const page = await organizationService.getAllOrganizations({ limit: 20 });
      setOrganizations(page.organizations);
      setFilteredOrganizations(page.organizations);
      calculateStatistics(page.organizations);
      setNextCursor(page.nextCursor);
      setHasNextPage(page.hasNextPage);

      for (const org of page.organizations) {
        try {
          await updateItem(org._id, { ...org, id: org._id });
        } catch (error) {
          console.warn("Failed to persist organization to IndexedDB:", error);
        }
      }

      return page.organizations;
    });
  }, [executeAsync, updateItem, calculateStatistics, getAll]);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || loadingMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const page = await organizationService.getAllOrganizations({
        cursor: nextCursor,
        limit: 20,
      });
      setOrganizations((prev) => {
        const combined = [...prev, ...page.organizations];
        calculateStatistics(combined);
        return combined;
      });
      setNextCursor(page.nextCursor);
      setHasNextPage(page.hasNextPage);

      for (const org of page.organizations) {
        try {
          await updateItem(org._id, { ...org, id: org._id });
        } catch (error) {
          console.warn("Failed to persist organization to IndexedDB:", error);
        }
      }
      setLoadingMore(false);
    } catch (error) {
      console.error("Error loading more organizations:", error);
      setLoadingMore(false);
    }
  }, [hasNextPage, loadingMore, nextCursor, updateItem, calculateStatistics]);

  const fetchOrganizationById = useCallback(
    async (id: string) => {
      return executeAsync(async () => {
        const organization = await organizationService.getOrganizationById(id);
        return organization;
      });
    },
    [executeAsync],
  );

  const createOrganization = useCallback(
    async (organizationData: Partial<Organization>) => {
      return executeAsync(async () => {
        const newOrganization =
          await organizationService.createOrganization(organizationData);
        setOrganizations((prev) => [...prev, newOrganization]);
        try {
          await updateItem(newOrganization._id, {
            ...newOrganization,
            id: newOrganization._id,
          });
        } catch (error) {
          console.warn("Failed to persist organization to IndexedDB:", error);
        }
        await fetchOrganizations();
        return newOrganization;
      });
    },
    [executeAsync, updateItem, fetchOrganizations],
  );

  const updateOrganization = useCallback(
    async (id: string, updates: Partial<Organization>) => {
      return executeAsync(async () => {
        const updated = await organizationService.updateOrganization(
          id,
          updates,
        );
        setOrganizations((prev) =>
          prev.map((org) => (org._id === id ? updated : org)),
        );
        await updateItem(id, { ...updated, id: updated._id });
        await fetchOrganizations();
        return updated;
      });
    },
    [executeAsync, updateItem, fetchOrganizations],
  );

  const deleteOrganization = useCallback(
    async (id: string) => {
      return executeAsync(async () => {
        await organizationService.deleteOrganization(id);
        setOrganizations((prev) => prev.filter((org) => org._id !== id));
        await deleteItem(id);
        await fetchOrganizations();
      });
    },
    [executeAsync, deleteItem, fetchOrganizations],
  );

  const searchOrganizations = useCallback(
    async (query: string) => {
      if (!query || query.trim() === "") {
        setIsSearchMode(false);
        applyFilters();
        return;
      }

      setIsSearchMode(true);
      setSearchLoading(true);

      try {
        const results = await organizationService.searchOrganizations(query.trim());
        setFilteredOrganizations(results);
        calculateStatistics(results);
      } catch (err) {
        console.error("Organization search failed:", err);
      } finally {
        setSearchLoading(false);
      }
    },
    [applyFilters, calculateStatistics],
  );

  const updateFilter = useCallback((key: keyof Filters, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      industry: "",
      search: "",
      dateFrom: "",
      dateTo: "",
    });
    setFilteredOrganizations(organizations);
  }, [organizations]);

  const bulkUpdateOrganizations = useCallback(
    async (ids: string[], updates: Partial<Organization>) => {
      return executeAsync(async () => {
        await organizationService.bulkUpdateOrganizations(ids, updates);
        const updatedOrganizations = ids
          .map((id) => {
            const org = organizations.find((o) => o._id === id);
            return org ? { ...org, ...updates } : null;
          })
          .filter(Boolean) as Organization[];

        setOrganizations((prev) =>
          prev.map((org) =>
            ids.includes(org._id) ? { ...org, ...updates } : org,
          ),
        );
        for (const org of updatedOrganizations) {
          await updateItem(org._id, { ...org, id: org._id });
        }
        await fetchOrganizations();
      });
    },
    [executeAsync, updateItem, fetchOrganizations, organizations],
  );

  const bulkDeleteOrganizations = useCallback(
    async (ids: string[]) => {
      return executeAsync(async () => {
        await organizationService.bulkDeleteOrganizations(ids);
        setOrganizations((prev) =>
          prev.filter((org) => !ids.includes(org._id)),
        );
        for (const id of ids) {
          await deleteItem(id);
        }
        await fetchOrganizations();
      });
    },
    [executeAsync, deleteItem, fetchOrganizations],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    applyFilters();
  }, [applyFilters]);

  // Derived data
  const stats = useMemo(() => statistics, [statistics]);
  const totalPages = useMemo(
    () => Math.ceil(filteredOrganizations.length / 20),
    [filteredOrganizations],
  );

  return {
    // Data
    organizations,
    filteredOrganizations,
    statistics: stats,
    filters,
    loading,
    error,
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

    nextCursor,
    hasNextPage,
    loadingMore,
    loadMore,
  };
};
