import { useState, useCallback, useEffect, useMemo } from "react";
import { useAsync, useIndexedDB } from "@/hooks";
import tenantService from "@/services/tenantService";
import type { Tenant, CreateTenantDto, UpdateTenantDto } from "@/types/tenant";

export interface TenantFilters {
  search: string;
  dateFrom: string;
  dateTo: string;
}

interface TenantStatistics {
  total: number;
}

const useTenantData = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filters, setFilters] = useState<TenantFilters>({
    search: "",
    dateFrom: "",
    dateTo: "",
  });

  const { updateItem } = useIndexedDB<Tenant & { id: string }>("tenants");

  const fetchTenants = useCallback(async () => {
    const data = await tenantService.getAllTenants();
    setTenants(data);
    
    // Store in IndexedDB for offline access
    try {
      for (const tenant of data) {
        await updateItem(tenant._id, { ...tenant, id: tenant._id });
      }
    } catch (error) {
      console.error("Error storing tenants in IndexedDB:", error);
    }
    
    return data;
  }, [updateItem]);

  const { execute, loading, error } = useAsync<Tenant[]>();

  useEffect(() => {
    execute(fetchTenants);
  }, [execute, fetchTenants]);

  // Statistics calculation
  const statistics: TenantStatistics = useMemo(() => {
    return {
      total: tenants.length,
    };
  }, [tenants]);

  // Filtered tenants
  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      // Search filter (name, email, mobile)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          tenant.tenantName?.toLowerCase().includes(searchLower) ||
          tenant.email?.toLowerCase().includes(searchLower) ||
          tenant.mobile?.includes(filters.search);

        if (!matchesSearch) return false;
      }

      // Date range filter
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
  }, [tenants, filters]);

  // Filter update function
  const updateFilter = useCallback(
    <K extends keyof TenantFilters>(key: K, value: TenantFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      dateFrom: "",
      dateTo: "",
    });
  }, []);

  // CRUD Operations
  const createTenant = useCallback(
    async (tenantData: CreateTenantDto) => {
      const newTenant = await tenantService.createTenant(tenantData);
      setTenants((prev) => [...prev, newTenant]);
      
      try {
        await updateItem(newTenant._id, { ...newTenant, id: newTenant._id });
      } catch (error) {
        console.error("Error storing new tenant in IndexedDB:", error);
      }
      
      return newTenant;
    },
    [updateItem],
  );

  const updateTenant = useCallback(
    async (tenantId: string, tenantData: UpdateTenantDto) => {
      const updatedTenant = await tenantService.updateTenant(tenantId, tenantData);
      setTenants((prev) =>
        prev.map((tenant) => (tenant._id === tenantId ? updatedTenant : tenant)),
      );
      
      try {
        await updateItem(tenantId, { ...updatedTenant, id: updatedTenant._id });
      } catch (error) {
        console.error("Error updating tenant in IndexedDB:", error);
      }
      
      return updatedTenant;
    },
    [updateItem],
  );

  const deleteTenant = useCallback(async (tenantId: string) => {
    await tenantService.deleteTenant(tenantId);
    setTenants((prev) => prev.filter((tenant) => tenant._id !== tenantId));
  }, []);

  // Refresh tenants
  const refresh = useCallback(() => {
    execute(fetchTenants);
  }, [execute, fetchTenants]);

  return {
    // Data
    tenants,
    filteredTenants,
    statistics,

    // State
    loading,
    error,

    // Filters
    filters,
    updateFilter,
    clearFilters,

    // CRUD
    createTenant,
    updateTenant,
    deleteTenant,

    // Additional operations
    refresh,
  };
};

export default useTenantData;
