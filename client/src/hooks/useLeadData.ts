import { useState, useCallback, useEffect } from "react";
import leadService from "../services/leadService";
import type { Lead } from "../types";
import { useIndexedDB } from "./useIndexedDB";

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
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [statistics, setStatistics] = useState<LeadStatistics>({
    total: 0,
    byStatus: {},
    bySource: {},
    conversionRate: "0",
  });
  const [filters, setFilters] = useState<LeadFilters>({});

  // Cursor state
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const { updateItem, getAll } = useIndexedDB<Lead & { id: string }>("leads");

  const calculateStatistics = useCallback((data: Lead[]) => {
    const byStatus: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    data.forEach((lead) => {
      if (lead.leadStatus)
        byStatus[lead.leadStatus] = (byStatus[lead.leadStatus] || 0) + 1;
      if (lead.leadSource)
        bySource[lead.leadSource] = (bySource[lead.leadSource] || 0) + 1;
    });

    const converted = byStatus["Converted"] || 0;
    const conversionRate =
      data.length > 0 ? ((converted / data.length) * 100).toFixed(1) : "0";

    setStatistics({ total: data.length, byStatus, bySource, conversionRate });
  }, []);

  const applyFilters = useCallback(
    (data: Lead[], currentFilters: LeadFilters) => {
      let filtered = [...data];

      if (currentFilters.status) {
        filtered = filtered.filter(
          (l) => l.leadStatus === currentFilters.status,
        );
      }
      if (currentFilters.source) {
        filtered = filtered.filter(
          (l) => l.leadSource === currentFilters.source,
        );
      }
      if (currentFilters.search) {
        const searchLower = currentFilters.search.toLowerCase();
        filtered = filtered.filter(
          (l) =>
            l.leadFirstName?.toLowerCase().includes(searchLower) ||
            l.leadLastName?.toLowerCase().includes(searchLower) ||
            l.leadEmail?.toLowerCase().includes(searchLower),
        );
      }
      if (currentFilters.dateFrom) {
        const fromTime = new Date(currentFilters.dateFrom).getTime();
        filtered = filtered.filter(
          (l) => new Date(l.createdAt ?? "").getTime() >= fromTime,
        );
      }
      if (currentFilters.dateTo) {
        const toTime = new Date(currentFilters.dateTo).getTime();
        filtered = filtered.filter(
          (l) => new Date(l.createdAt ?? "").getTime() <= toTime,
        );
      }

      setFilteredLeads(filtered);
    },
    [],
  );

  // Initial fetch — resets all state
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    setLeads([]);
    setFilteredLeads([]);
    setNextCursor(null);
    setHasNextPage(false);

    try {
      if (!navigator.onLine) {
        const cached = await getAll();
        setLeads(cached);
        applyFilters(cached, filters);
        calculateStatistics(cached);
        setLoading(false);
        return;
      }

      const page = await leadService.getAllLeads({ limit: PAGE_LIMIT });
      setLeads(page.leads);
      applyFilters(page.leads, filters);
      calculateStatistics(page.leads);
      setNextCursor(page.nextCursor);
      setHasNextPage(page.hasNextPage);

      for (const lead of page.leads) {
        try {
          await updateItem(lead._id, { ...lead, id: lead._id });
        } catch (e) {
          console.warn("Failed to cache lead in IndexedDB:", e);
        }
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch leads"));
      setLoading(false);
    }
  }, [filters, applyFilters, calculateStatistics, getAll, updateItem]);

  // Load next page and append
  const loadMore = useCallback(async () => {
    if (!hasNextPage || loadingMore || !nextCursor) return;

    setLoadingMore(true);
    try {
      const page = await leadService.getAllLeads({
        cursor: nextCursor,
        limit: PAGE_LIMIT,
      });
      setLeads((prev) => {
        const combined = [...prev, ...page.leads];
        applyFilters(combined, filters);
        calculateStatistics(combined);
        return combined;
      });
      setNextCursor(page.nextCursor);
      setHasNextPage(page.hasNextPage);
      setLoadingMore(false);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to load more leads"),
      );
      setLoadingMore(false);
    }
  }, [
    hasNextPage,
    loadingMore,
    nextCursor,
    filters,
    applyFilters,
    calculateStatistics,
  ]);

  const updateFilter = useCallback(
    (key: keyof LeadFilters, value: string) => {
      setFilters((prev) => {
        const updated = { ...prev, [key]: value };
        applyFilters(leads, updated);
        return updated;
      });
    },
    [leads, applyFilters],
  );

  const resetFilters = useCallback(() => {
    setFilters({});
    applyFilters(leads, {});
  }, [leads, applyFilters]);

  // CRUD helpers that refresh
  const createLead = useCallback(
    async (leadData: Partial<Lead>) => {
      const newLead = await leadService.createLead(leadData);
      await fetchLeads();
      return newLead;
    },
    [fetchLeads],
  );

  const updateLead = useCallback(
    async (id: string, updates: Partial<Lead>) => {
      const updated = await leadService.updateLead(id, updates);
      setLeads((prev) => {
        const next = prev.map((l) => (l._id === id ? updated : l));
        applyFilters(next, filters);
        calculateStatistics(next);
        return next;
      });
      return updated;
    },
    [filters, applyFilters, calculateStatistics],
  );

  const deleteLead = useCallback(
    async (id: string) => {
      await leadService.deleteLead(id);
      setLeads((prev) => {
        const next = prev.filter((l) => l._id !== id);
        applyFilters(next, filters);
        calculateStatistics(next);
        return next;
      });
    },
    [filters, applyFilters, calculateStatistics],
  );

  const fetchLeadById = useCallback(async (id: string) => {
    return leadService.getLeadById(id);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLeads();
  }, []);

  return {
    leads,
    filteredLeads,
    loading,
    loadingMore,
    error,
    statistics,
    filters,
    hasNextPage,
    updateFilter,
    resetFilters,
    fetchLeads,
    loadMore,
    createLead,
    updateLead,
    deleteLead,
    fetchLeadById,
  };
}
