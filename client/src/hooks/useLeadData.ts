import { useState, useEffect, useCallback } from "react";
import type { Lead, LeadStatus, LeadSource } from "../types";
import { leadService } from "../services";
import { useAsync } from "./useAsync";
import { useIndexedDB } from "./useIndexedDB";

interface Statistics {
  total: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
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
 * @returns {Object} Lead data and operations
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

  const { execute: executeAsync, loading, error } = useAsync();
  const { addItem, updateItem, deleteItem, getAll } = useIndexedDB("leads");

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
        await addItem(lead);
      }

      return data;
    });
  }, [executeAsync, addItem]);

  /**
   * Fetch single lead by ID
   * @param {string} id - Lead ID
   */
  const fetchLeadById = useCallback(
    async (id: any) => {
      return executeAsync(async () => {
        const lead = await leadService.getLeadById(id);
        return lead;
      });
    },
    [executeAsync],
  );

  /**
   * Create new lead
   * @param {Object} leadData - Lead data
   */
  const createLead = useCallback(
    async (leadData: any) => {
      return executeAsync(async () => {
        const newLead = await leadService.createLead(leadData);
        setLeads((prev) => [...prev, newLead]);
        await addItem(newLead);
        await fetchLeads(); // Refresh to recalculate stats
        return newLead;
      });
    },
    [executeAsync, addItem, fetchLeads],
  );

  /**
   * Update existing lead
   * @param {string} id - Lead ID
   * @param {Object} updates - Updated data
   */
  const updateLead = useCallback(
    async (id: string, updates: any) => {
      return executeAsync(async () => {
        const updated = await leadService.updateLead(id, updates);
        setLeads((prev) =>
          prev.map((lead) => (lead.id === id ? updated : lead)),
        );
        await updateItem(id, updated);
        await fetchLeads(); // Refresh to recalculate stats
        return updated;
      });
    },
    [executeAsync, updateItem, fetchLeads],
  );

  /**
   * Delete lead
   * @param {string} id - Lead ID
   */
  const deleteLead = useCallback(
    async (id: string) => {
      return executeAsync(async () => {
        await leadService.deleteLead(id);
        setLeads((prev) => prev.filter((lead) => lead.id !== id));
        await deleteItem(id);
        await fetchLeads(); // Refresh to recalculate stats
      });
    },
    [executeAsync, deleteItem, fetchLeads],
  );

  /**
   * Search leads
   * @param {string} query - Search query
   */
  const searchLeads = useCallback(
    async (query: any) => {
      return executeAsync(async () => {
        const results = await leadService.searchLeads(query);
        setFilteredLeads(results);
        return results;
      });
    },
    [executeAsync],
  );

  /**
   * Get leads by status
   * @param {string} status - Lead status
   */
  const getLeadsByStatus = useCallback(
    async (status: any) => {
      return executeAsync(async () => {
        const results = await leadService.getLeadsByStatus(status);
        return results;
      });
    },
    [executeAsync],
  );

  /**
   * Bulk update leads
   * @param {Array} leadIds - Array of lead IDs
   * @param {Object} updates - Update data
   */
  const bulkUpdateLeads = useCallback(
    async (leadIds: any, updates: any) => {
      return executeAsync(async () => {
        const results = await leadService.bulkUpdateLeads(leadIds, updates);
        await fetchLeads(); // Refresh all data
        return results;
      });
    },
    [executeAsync, fetchLeads],
  );

  /**
   * Bulk delete leads
   * @param {Array} leadIds - Array of lead IDs
   */
  const bulkDeleteLeads = useCallback(
    async (leadIds: any) => {
      return executeAsync(async () => {
        await leadService.bulkDeleteLeads(leadIds);
        await fetchLeads(); // Refresh all data
      });
    },
    [executeAsync, fetchLeads],
  );

  /**
   * Apply filters to leads
   */
  const applyFilters = useCallback(() => {
    let filtered = [...leads];

    if (filters.status) {
      filtered = filtered.filter((lead) => lead.status === filters.status);
    }

    if (filters.source) {
      filtered = filtered.filter((lead) => lead.source === filters.source);
    }

    if (filters.stage) {
      filtered = filtered.filter((lead) => lead.stage === filters.stage);
    }

    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.leadFirstName?.toLowerCase().includes(query) ||
          lead.leadLastName?.toLowerCase().includes(query) ||
          lead.leadEmail?.toLowerCase().includes(query) ||
          lead.organizationId?.toLowerCase().includes(query),
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(
        (lead) => new Date(lead.createdAt) >= new Date(filters.dateFrom),
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(
        (lead) => new Date(lead.createdAt) <= new Date(filters.dateTo),
      );
    }

    setFilteredLeads(filtered);
    calculateStatistics(filtered);
  }, [leads, filters]);

  /**
   * Calculate statistics from leads
   * @param {Array} leadsData - Array of leads
   */
  const calculateStatistics = (leadsData: Lead[]) => {
    const stats: Statistics = {
      total: leadsData.length,
      byStatus: {},
      bySource: {},
      byStage: {},
      conversionRate: 0,
    };

    let convertedCount = 0;

    leadsData.forEach((lead) => {
      // Count by status
      stats.byStatus[lead.leadStatus] =
        (stats.byStatus[lead.leadStatus] || 0) + 1;

      // Count by source
      stats.bySource[lead.leadSource] =
        (stats.bySource[lead.leadSource] || 0) + 1;

      // Count by stage (not in Lead model, skip for now)
      // stats.byStage[lead.stage] = (stats.byStage[lead.stage] || 0) + 1;

      // Count conversions
      if (lead.leadStatus === "Converted") {
        convertedCount++;
      }
    });

    // Calculate conversion rate
    stats.conversionRate =
      stats.total > 0
        ? parseFloat(((convertedCount / stats.total) * 100).toFixed(2))
        : 0;

    setStatistics(stats);
  };

  /**
   * Update filters
   * @param {Object} newFilters - Filter updates
   */
  const updateFilters = useCallback((newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
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
    calculateStatistics(leads);
  }, [leads]);

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Load from IndexedDB on mount
  useEffect(() => {
    const loadFromCache = async () => {
      const cached = await getAll();
      if (cached && Array.isArray(cached) && cached.length > 0) {
        const leadData = cached as Lead[];
        setLeads(leadData);
        setFilteredLeads(leadData);
        calculateStatistics(leadData);
      }
    };
    loadFromCache();
  }, [getAll]);

  return {
    // Data
    leads,
    filteredLeads,
    statistics,
    filters,

    // State
    loading,
    error,

    // CRUD Operations
    fetchLeads,
    fetchLeadById,
    createLead,
    updateLead,
    deleteLead,
    searchLeads,
    getLeadsByStatus,
    bulkUpdateLeads,
    bulkDeleteLeads,

    // Filter Operations
    updateFilters,
    resetFilters,
  };
};
