import { useState, useCallback, useEffect, useMemo } from "react";
import { useAsync, useIndexedDB } from "@/hooks";
import dealService from "@/services/dealService";
import type { Deal, DealStatus, CreateDealDTO, UpdateDealDTO } from "@/types";

export interface DealFilters {
  status: DealStatus | "";
  stage: DealStatus | "";
  search: string;
  dateFrom: string;
  dateTo: string;
  minValue: number | null;
  maxValue: number | null;
}

interface DealStatistics {
  total: number;
  byStatus: Record<DealStatus, number>;
  byStage: Record<string, number>;
  totalValue: number;
  avgValue: number;
  forecastValue: number;
}

const useDealData = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters] = useState<DealFilters>({
    status: "",
    stage: "",
    search: "",
    dateFrom: "",
    dateTo: "",
    minValue: null,
    maxValue: null,
  });

  const { updateItem } = useIndexedDB<Deal & { id: string }>("deals");

  const fetchDeals = useCallback(async () => {
    const page = await dealService.getAllDeals({ limit: 20 });
    setDeals(page.deals);
    setNextCursor(page.nextCursor);
    setHasNextPage(page.hasNextPage);

    try {
      for (const deal of page.deals) {
        await updateItem(deal._id, { ...deal, id: deal._id });
      }
    } catch (error) {
      console.error("Error storing deals in IndexedDB:", error);
    }

    return page.deals;
  }, [updateItem]);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || loadingMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const page = await dealService.getAllDeals({
        cursor: nextCursor,
        limit: 20,
      });
      setDeals((prev) => [...prev, ...page.deals]);
      setNextCursor(page.nextCursor);
      setHasNextPage(page.hasNextPage);

      for (const deal of page.deals) {
        await updateItem(deal._id, { ...deal, id: deal._id });
      }
    } catch (error) {
      console.error("Error loading more deals:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [hasNextPage, loadingMore, nextCursor, updateItem]);

  const { execute, loading, error } = useAsync<Deal[]>();

  useEffect(() => {
    execute(fetchDeals);
  }, [execute, fetchDeals]);

  const statistics: DealStatistics = useMemo(() => {
    const total = deals.length;

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

    deals.forEach((deal) => {
      if (deal.dealStatus) {
        byStatus[deal.dealStatus] = (byStatus[deal.dealStatus] || 0) + 1;

        // Map status to stage for byStage
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

      // Calculate forecast value (only for deals not yet won or lost)
      if (deal.dealStatus !== "Won" && deal.dealStatus !== "Lost") {
        forecastValue += deal.dealValue || 0;
      }
    });

    const avgValue = total > 0 ? totalValue / total : 0;

    return { total, byStatus, byStage, totalValue, avgValue, forecastValue };
  }, [deals]);

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      if (filters.status && deal.dealStatus !== filters.status) return false;
      if (filters.stage && deal.dealStatus !== filters.stage) return false;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          deal.dealName?.toLowerCase().includes(searchLower) ||
          deal.organizationId?.toString().includes(searchLower);
        if (!matchesSearch) return false;
      }

      const dealValue = deal.dealValue || 0;
      if (filters.minValue !== null && dealValue < filters.minValue)
        return false;
      if (filters.maxValue !== null && dealValue > filters.maxValue)
        return false;

      if (filters.dateFrom || filters.dateTo) {
        const dealDate = deal.createdAt ? new Date(deal.createdAt) : new Date();
        if (filters.dateFrom) {
          if (dealDate < new Date(filters.dateFrom)) return false;
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

  const updateFilter = useCallback(
    <K extends keyof DealFilters>(key: K, value: DealFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setFilters({
      status: "",
      stage: "",
      search: "",
      dateFrom: "",
      dateTo: "",
      minValue: null,
      maxValue: null,
    });
  }, []);

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

  const bulkUpdateDeals = useCallback(
    async (dealIds: string[], updateData: Partial<UpdateDealDTO>) => {
      const result = await dealService.bulkUpdateDeals(dealIds, updateData);
      await execute(fetchDeals);
      return result;
    },
    [execute, fetchDeals],
  );

  const bulkDeleteDeals = useCallback(async (dealIds: string[]) => {
    await dealService.bulkDeleteDeals(dealIds);
    setDeals((prev) => prev.filter((deal) => !dealIds.includes(deal._id)));
  }, []);

  const refresh = useCallback(() => {
    execute(fetchDeals);
  }, [execute, fetchDeals]);

  return {
    deals,
    filteredDeals,
    statistics,
    loading,
    error,
    filters,
    updateFilter,
    clearFilters,
    createDeal,
    updateDeal,
    deleteDeal,
    bulkUpdateDeals,
    bulkDeleteDeals,
    refresh,
    nextCursor,
    hasNextPage,
    loadingMore,
    loadMore,
  };
};

export default useDealData;
