import { useState, useEffect, useCallback, useMemo } from "react";
import type { Lead, LeadStatus, LeadSource } from "../types";
import { leadService } from "../services";
import { useAsync } from "./useAsync";
import { useIndexedDB } from "./useIndexedDB";

interface Statistics {
  total: number;
  byStatus: Record<LeadStatus | string, number>;
  bySource: Record<LeadSource | string, number>;
  byStage: Record<string, number>;
  conversionRate: number;
}

interface Filters {
  status: LeadStatus | "";
  source: LeadSource | "";
  stage: string;
  search: string;
  dateFrom: string;
  dateTo: string;
}

/**
 * Lead Data Management Hook
 * Handles all lead-related operations including CRUD, filtering, and statistics
 *
 * @returns Lead data and operations
 */
export const useLeadData = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    byStatus: {},
    bySource: {},
    byStage: {},
    conversionRate: 0,
  });
  const [filters, setFilters] = useState<Filters>({
    status: "",
    source: "",
    stage: "",
    search: "",
    dateFrom: "",
    dateTo: "",
  });

  const {
    execute: executeAsync,
    loading,
    error,
  } = useAsync<Lead | Lead[] | void>();
  const { addItem, updateItem, deleteItem } = useIndexedDB("leads");

  /**
   * Calculate statistics from leads
   */
  const calculateStatistics = useCallback((leadsData: Lead[]) => {
    const stats: Statistics = {
      total: leadsData.length,
      byStatus: {},
      bySource: {},
      byStage: {},
      conversionRate: 0,
    };

    leadsData.forEach((lead) => {
      // Count by status
      stats.byStatus[lead.leadStatus] = (stats.byStatus[lead.leadStatus] ?? 0) + 1;

      // Count by source
      stats.bySource[lead.leadSource] = (stats.bySource[lead.leadSource] ?? 0) + 1;

      // Count by stage (not available in current schema)
      // stats.byStage[lead.stage ?? "unknown"] =
      //   (stats.byStage[lead.stage ?? "unknown"] ?? 0) + 1;
    });

    // Calculate conversion rate
    const converted = stats.byStatus["converted"] ?? 0;
    stats.conversionRate =
      stats.total > 0 ? Math.round((converted / stats.total) * 100) : 0;

    setStatistics(stats);
  }, []);

  /**
   * Apply filters to leads
   */
  const applyFilters = useCallback(() => {
    let filtered = [...leads];

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter((lead) => lead.leadStatus === filters.status);
    }

    // Filter by source
    if (filters.source) {
      filtered = filtered.filter((lead) => lead.leadSource === filters.source);
    }

    // Filter by stage (not available in current schema)
    // if (filters.stage) {
    //   filtered = filtered.filter((lead) => lead.stage === filters.stage);
    // }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          (lead.leadFirstName?.toLowerCase().includes(searchLower) ?? false) ||
          (lead.leadLastName?.toLowerCase().includes(searchLower) ?? false) ||
          (lead.leadEmail?.toLowerCase().includes(searchLower) ?? false),
      );
    }

    // Filter by date range
    if (filters.dateFrom) {
      const fromTime = new Date(filters.dateFrom).getTime();
      filtered = filtered.filter(
        (lead) => new Date(lead.createdAt ?? "").getTime() >= fromTime,
      );
    }

    if (filters.dateTo) {
      const toTime = new Date(filters.dateTo).getTime();
      filtered = filtered.filter(
        (lead) => new Date(lead.createdAt ?? "").getTime() <= toTime,
      );
    }

    setFilteredLeads(filtered);
  }, [leads, filters]);

  /**
   * Fetch all leads from API
   */
  const fetchLeads = useCallback(async () => {
    return executeAsync(async () => {
      const data = await leadService.getAllLeads();
      setLeads(data);
      setFilteredLeads(data);
      calculateStatistics(data);

      // Persist to IndexedDB
      for (const lead of data) {
        await addItem({ ...lead, id: lead._id });
      }

      return data;
    });
  }, [executeAsync, addItem, calculateStatistics]);

  /**
   * Fetch single lead by ID
   */
  const fetchLeadById = useCallback(
    async (id: string) => {
      return executeAsync(async () => {
        const lead = await leadService.getLeadById(id);
        return lead;
      });
    },
    [executeAsync],
  );

  /**
   * Create new lead
   */
  const createLead = useCallback(
    async (leadData: Partial<Lead>) => {
      return executeAsync(async () => {
        const newLead = await leadService.createLead(leadData);
        setLeads((prev) => [...prev, newLead]);
        await addItem({ ...newLead, id: newLead._id });
        await fetchLeads(); // Refresh to recalculate stats
        return newLead;
      });
    },
    [executeAsync, addItem, fetchLeads],
  );

  /**
   * Update existing lead
   */
  const updateLead = useCallback(
    async (id: string, updates: Partial<Lead>) => {
      return executeAsync(async () => {
        const updated = await leadService.updateLead(id, updates);
        setLeads((prev) =>
          prev.map((lead) => (lead._id === id ? updated : lead)),
        );
        await updateItem(id, { ...updated, id: updated._id });
        await fetchLeads(); // Refresh to recalculate stats
        return updated;
      });
    },
    [executeAsync, updateItem, fetchLeads],
  );

  /**
   * Delete lead
   */
  const deleteLead = useCallback(
    async (id: string) => {
      return executeAsync(async () => {
        await leadService.deleteLead(id);
        setLeads((prev) => prev.filter((lead) => lead._id !== id));
        await deleteItem(id);
        await fetchLeads(); // Refresh to recalculate stats
      });
    },
    [executeAsync, deleteItem, fetchLeads],
  );

  /**
   * Search leads
   */
  const searchLeads = useCallback(
    async (query: string) => {
      return executeAsync(async () => {
        const results = await leadService.searchLeads(query);
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
      status: "",
      source: "",
      stage: "",
      search: "",
      dateFrom: "",
      dateTo: "",
    });
    setFilteredLeads(leads);
  }, [leads]);

  /**
   * Bulk update leads
   */
  const bulkUpdateLeads = useCallback(
    async (ids: string[], updates: Partial<Lead>) => {
      return executeAsync(async () => {
        await leadService.bulkUpdateLeads(ids, updates);
        const updatedLeads = ids.map(id => {
          const lead = leads.find(l => l._id === id);
          return lead ? { ...lead, ...updates } : null;
        }).filter(Boolean) as Lead[];
        
        setLeads((prev) =>
          prev.map((lead) =>
            ids.includes(lead._id) ? { ...lead, ...updates } : lead,
          ),
        );
        for (const lead of updatedLeads) {
          await updateItem(lead._id, { ...lead, id: lead._id });
        }
        await fetchLeads();
      });
    },
    [executeAsync, updateItem, fetchLeads, leads],
  );

  /**
   * Bulk delete leads
   */
  const bulkDeleteLeads = useCallback(
    async (ids: string[]) => {
      return executeAsync(async () => {
        await leadService.bulkDeleteLeads(ids);
        setLeads((prev) => prev.filter((lead) => !ids.includes(lead._id)));
        for (const id of ids) {
          await deleteItem(id);
        }
        await fetchLeads();
      });
    },
    [executeAsync, deleteItem, fetchLeads],
  );

  // Apply filters when leads or filters change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Derived data
  const stats = useMemo(() => statistics, [statistics]);
  const totalPages = useMemo(
    () => Math.ceil(filteredLeads.length / 20),
    [filteredLeads],
  );

  return {
    // Data
    leads,
    filteredLeads,
    statistics: stats,
    filters,
    loading,
    error,
    totalPages,

    // Methods
    fetchLeads,
    fetchLeadById,
    createLead,
    updateLead,
    deleteLead,
    searchLeads,
    bulkUpdateLeads,
    bulkDeleteLeads,

    // Filter methods
    updateFilter,
    resetFilters,
  };
};
