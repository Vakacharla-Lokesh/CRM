import { useState, useCallback, useEffect, useMemo } from "react";
import { useAsync, useIndexedDB } from "@/hooks";
import dealService from "@/services/dealService";
import type {
  Deal,
  DealStage,
  CreateDealDTO,
  UpdateDealDTO,
} from "@/types";

export interface DealFilters {
  stage: DealStage | "";
  search: string;
  dateFrom: string;
  dateTo: string;
  minValue: number | null;
  maxValue: number | null;
}

interface DealStatistics {
  total: number;
  byStage: Record<DealStage, number>;
  totalValue: number;
  avgValue: number;
  forecastValue: number;
}

const useDealData = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filters, setFilters] = useState<DealFilters>({
    stage: "",
    search: "",
    dateFrom: "",
    dateTo: "",
    minValue: null,
    maxValue: null,
  });

  const { updateItem } = useIndexedDB<Deal & { id: string }>("deals");

  const fetchDeals = useCallback(async () => {
    const data = await dealService.getAllDeals();
    setDeals(data);
    
    // Store in IndexedDB for offline access
    try {
      for (const deal of data) {
        await updateItem(deal._id, { ...deal, id: deal._id });
      }
    } catch (error) {
      console.error("Error storing deals in IndexedDB:", error);
    }
    
    return data;
  }, [updateItem]);

  const { execute, loading, error } = useAsync<Deal[]>();

  useEffect(() => {
    execute(fetchDeals);
  }, [execute, fetchDeals]);

  // Statistics calculation
  const statistics: DealStatistics = useMemo(() => {
    const total = deals.length;
    
    const byStage: Record<DealStage, number> = {
      prospecting: 0,
      qualification: 0,
      proposal: 0,
      negotiation: 0,
      closed_won: 0,
      closed_lost: 0,
    };

    let totalValue = 0;
    let forecastValue = 0;

    deals.forEach((deal) => {
      if (deal.dealStage) {
        byStage[deal.dealStage] = (byStage[deal.dealStage] || 0) + 1;
      }
      
      const value = deal.dealValue || 0;
      totalValue += value;
      
      // Forecast = value * probability / 100
      const probability = deal.dealProbability || 0;
      forecastValue += (value * probability) / 100;
    });

    const avgValue = total > 0 ? totalValue / total : 0;

    return {
      total,
      byStage,
      totalValue,
      avgValue,
      forecastValue,
    };
  }, [deals]);

  // Filtered deals
  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      // Stage filter
      if (filters.stage && deal.dealStage !== filters.stage) return false;

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          deal.dealName?.toLowerCase().includes(searchLower) ||
          deal.organizationId?.toString().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Value range filter
      const dealValue = deal.dealValue || 0;
      if (filters.minValue !== null && dealValue < filters.minValue)
        return false;
      if (filters.maxValue !== null && dealValue > filters.maxValue)
        return false;

      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        const dealDate = deal.createdAt
          ? new Date(deal.createdAt)
          : new Date();
        
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          if (dealDate < fromDate) return false;
        }
        
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (dealDate > toDate) return false;
        }
      }

      return true;
    });
  }, [deals, filters]);

  // Filter update function
  const updateFilter = useCallback(
    <K extends keyof DealFilters>(key: K, value: DealFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      stage: "",
      search: "",
      dateFrom: "",
      dateTo: "",
      minValue: null,
      maxValue: null,
    });
  }, []);

  // CRUD Operations
  const createDeal = useCallback(
    async (dealData: CreateDealDTO) => {
      const newDeal = await dealService.createDeal(dealData);
      setDeals((prev) => [...prev, newDeal]);
      
      try {
        await updateItem(newDeal._id, { ...newDeal, id: newDeal._id });
      } catch (error) {
        console.error("Error storing new deal in IndexedDB:", error);
      }
      
      return newDeal;
    },
    [updateItem],
  );

  const updateDeal = useCallback(
    async (dealId: string, dealData: UpdateDealDTO) => {
      const updatedDeal = await dealService.updateDeal(dealId, dealData);
      setDeals((prev) =>
        prev.map((deal) => (deal._id === dealId ? updatedDeal : deal)),
      );
      
      try {
        await updateItem(dealId, { ...updatedDeal, id: updatedDeal._id });
      } catch (error) {
        console.error("Error updating deal in IndexedDB:", error);
      }
      
      return updatedDeal;
    },
    [updateItem],
  );

  const deleteDeal = useCallback(async (dealId: string) => {
    await dealService.deleteDeal(dealId);
    setDeals((prev) => prev.filter((deal) => deal._id !== dealId));
  }, []);

  // Bulk Operations
  const bulkUpdateDeals = useCallback(
    async (dealIds: string[], updateData: Partial<UpdateDealDTO>) => {
      const result = await dealService.bulkUpdateDeals(
        dealIds,
        updateData,
      );
      
      // Refresh deals after bulk update
      await execute(fetchDeals);
      
      return result;
    },
    [execute, fetchDeals],
  );

  const bulkDeleteDeals = useCallback(async (dealIds: string[]) => {
    await dealService.bulkDeleteDeals(dealIds);
    setDeals((prev) => prev.filter((deal) => !dealIds.includes(deal._id)));
  }, []);

  // Get deals by stage
  const getDealsByStage = useCallback(
    async (stage: DealStage) => {
      return dealService.getDealsByStage(stage);
    },
    [],
  );

  // Get deal statistics from server
  const getServerStats = useCallback(async () => {
    return dealService.getDealStats();
  }, []);

  // Refresh deals
  const refresh = useCallback(() => {
    execute(fetchDeals);
  }, [execute, fetchDeals]);

  return {
    // Data
    deals,
    filteredDeals,
    statistics,

    // State
    loading,
    error,

    // Filters
    filters,
    updateFilter,
    clearFilters,

    // CRUD
    createDeal,
    updateDeal,
    deleteDeal,

    // Bulk operations
    bulkUpdateDeals,
    bulkDeleteDeals,

    // Additional operations
    getDealsByStage,
    getServerStats,
    refresh,
  };
};

export default useDealData;
