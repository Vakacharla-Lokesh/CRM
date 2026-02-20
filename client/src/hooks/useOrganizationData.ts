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

/**
 * Organization Data Management Hook
 * Handles all organization-related operations including CRUD, filtering, and statistics
 *
 * @returns Organization data and operations
 */
export const useOrganizationData = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<
    Organization[]
  >([]);
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
  const { updateItem, deleteItem } = useIndexedDB("organizations");

  /**
   * Calculate statistics from organizations
   */
  const calculateStatistics = useCallback(
    (organizationsData: Organization[]) => {
      const stats: Statistics = {
        total: organizationsData.length,
        byIndustry: {},
      };

      organizationsData.forEach((org) => {
        // Count by industry
        stats.byIndustry[org.organizationIndustry] =
          (stats.byIndustry[org.organizationIndustry] ?? 0) + 1;
      });

      setStatistics(stats);
    },
    [],
  );

  /**
   * Apply filters to organizations
   */
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
  }, [organizations, filters]);

  /**
   * Fetch all organizations from API
   */
  const fetchOrganizations = useCallback(async () => {
    return executeAsync(async () => {
      const data = await organizationService.getAllOrganizations();
      setOrganizations(data);
      setFilteredOrganizations(data);
      calculateStatistics(data);

      // Persist to IndexedDB (use updateItem to upsert)
      for (const org of data) {
        try {
          await updateItem(org._id, { ...org, id: org._id });
        } catch (error) {
          // Ignore errors for IndexedDB persistence
          console.warn("Failed to persist organization to IndexedDB:", error);
        }
      }

      return data;
    });
  }, [executeAsync, updateItem, calculateStatistics]);

  /**
   * Fetch single organization by ID
   */
  const fetchOrganizationById = useCallback(
    async (id: string) => {
      return executeAsync(async () => {
        const organization = await organizationService.getOrganizationById(id);
        return organization;
      });
    },
    [executeAsync],
  );

  /**
   * Create new organization
   */
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
        await fetchOrganizations(); // Refresh to recalculate stats
        return newOrganization;
      });
    },
    [executeAsync, updateItem, fetchOrganizations],
  );

  /**
   * Update existing organization
   */
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
        await fetchOrganizations(); // Refresh to recalculate stats
        return updated;
      });
    },
    [executeAsync, updateItem, fetchOrganizations],
  );

  /**
   * Delete organization
   */
  const deleteOrganization = useCallback(
    async (id: string) => {
      return executeAsync(async () => {
        await organizationService.deleteOrganization(id);
        setOrganizations((prev) => prev.filter((org) => org._id !== id));
        await deleteItem(id);
        await fetchOrganizations(); // Refresh to recalculate stats
      });
    },
    [executeAsync, deleteItem, fetchOrganizations],
  );

  /**
   * Search organizations
   */
  const searchOrganizations = useCallback(
    async (query: string) => {
      return executeAsync(async () => {
        const results = await organizationService.searchOrganizations(query);
        return results;
      });
    },
    [executeAsync],
  );

  /**
   * Update filter
   */
  const updateFilter = useCallback((key: keyof Filters, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  /**
   * Reset filters
   */
  const resetFilters = useCallback(() => {
    setFilters({
      industry: "",
      search: "",
      dateFrom: "",
      dateTo: "",
    });
    setFilteredOrganizations(organizations);
  }, [organizations]);

  /**
   * Bulk update organizations
   */
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

  /**
   * Bulk delete organizations
   */
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

  // Apply filters when organizations or filters change
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

    // Filter methods
    updateFilter,
    resetFilters,
  };
};
