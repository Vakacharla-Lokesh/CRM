import { useState, useEffect, useCallback } from 'react';
import { leadService } from '../services';
import { useAsync } from './useAsync';
import { useIndexedDB } from './useIndexedDB';

/**
 * Lead Data Management Hook
 * Handles all lead-related operations including CRUD, filtering, and statistics
 * 
 * @returns {Object} Lead data and operations
 */
export const useLeadData = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    byStatus: {},
    bySource: {},
    byStage: {},
    conversionRate: 0,
  });
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    stage: '',
    search: '',
    dateFrom: '',
    dateTo: '',
  });

  const { execute: executeAsync, loading, error } = useAsync();
  const { addItem, updateItem, deleteItem, getAll } = useIndexedDB('leads');

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
  const fetchLeadById = useCallback(async (id) => {
    return executeAsync(async () => {
      const lead = await leadService.getLeadById(id);
      return lead;
    });
  }, [executeAsync]);

  /**
   * Create new lead
   * @param {Object} leadData - Lead data
   */
  const createLead = useCallback(async (leadData) => {
    return executeAsync(async () => {
      const newLead = await leadService.createLead(leadData);
      setLeads(prev => [...prev, newLead]);
      await addItem(newLead);
      await fetchLeads(); // Refresh to recalculate stats
      return newLead;
    });
  }, [executeAsync, addItem, fetchLeads]);

  /**
   * Update existing lead
   * @param {string} id - Lead ID
   * @param {Object} updates - Updated data
   */
  const updateLead = useCallback(async (id, updates) => {
    return executeAsync(async () => {
      const updated = await leadService.updateLead(id, updates);
      setLeads(prev => prev.map(lead => lead.id === id ? updated : lead));
      await updateItem(id, updated);
      await fetchLeads(); // Refresh to recalculate stats
      return updated;
    });
  }, [executeAsync, updateItem, fetchLeads]);

  /**
   * Delete lead
   * @param {string} id - Lead ID
   */
  const deleteLead = useCallback(async (id) => {
    return executeAsync(async () => {
      await leadService.deleteLead(id);
      setLeads(prev => prev.filter(lead => lead.id !== id));
      await deleteItem(id);
      await fetchLeads(); // Refresh to recalculate stats
    });
  }, [executeAsync, deleteItem, fetchLeads]);

  /**
   * Search leads
   * @param {string} query - Search query
   */
  const searchLeads = useCallback(async (query) => {
    return executeAsync(async () => {
      const results = await leadService.searchLeads(query);
      setFilteredLeads(results);
      return results;
    });
  }, [executeAsync]);

  /**
   * Get leads by status
   * @param {string} status - Lead status
   */
  const getLeadsByStatus = useCallback(async (status) => {
    return executeAsync(async () => {
      const results = await leadService.getLeadsByStatus(status);
      return results;
    });
  }, [executeAsync]);

  /**
   * Bulk update leads
   * @param {Array} leadIds - Array of lead IDs
   * @param {Object} updates - Update data
   */
  const bulkUpdateLeads = useCallback(async (leadIds, updates) => {
    return executeAsync(async () => {
      const results = await leadService.bulkUpdateLeads(leadIds, updates);
      await fetchLeads(); // Refresh all data
      return results;
    });
  }, [executeAsync, fetchLeads]);

  /**
   * Bulk delete leads
   * @param {Array} leadIds - Array of lead IDs
   */
  const bulkDeleteLeads = useCallback(async (leadIds) => {
    return executeAsync(async () => {
      await leadService.bulkDeleteLeads(leadIds);
      await fetchLeads(); // Refresh all data
    });
  }, [executeAsync, fetchLeads]);

  /**
   * Apply filters to leads
   */
  const applyFilters = useCallback(() => {
    let filtered = [...leads];

    if (filters.status) {
      filtered = filtered.filter(lead => lead.status === filters.status);
    }

    if (filters.source) {
      filtered = filtered.filter(lead => lead.source === filters.source);
    }

    if (filters.stage) {
      filtered = filtered.filter(lead => lead.stage === filters.stage);
    }

    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.name?.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.company?.toLowerCase().includes(query)
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(lead => 
        new Date(lead.createdAt) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(lead => 
        new Date(lead.createdAt) <= new Date(filters.dateTo)
      );
    }

    setFilteredLeads(filtered);
    calculateStatistics(filtered);
  }, [leads, filters]);

  /**
   * Calculate statistics from leads
   * @param {Array} leadsData - Array of leads
   */
  const calculateStatistics = (leadsData) => {
    const stats = {
      total: leadsData.length,
      byStatus: {},
      bySource: {},
      byStage: {},
      conversionRate: 0,
    };

    let convertedCount = 0;

    leadsData.forEach(lead => {
      // Count by status
      stats.byStatus[lead.status] = (stats.byStatus[lead.status] || 0) + 1;

      // Count by source
      stats.bySource[lead.source] = (stats.bySource[lead.source] || 0) + 1;

      // Count by stage
      stats.byStage[lead.stage] = (stats.byStage[lead.stage] || 0) + 1;

      // Count conversions
      if (lead.status === 'converted' || lead.status === 'won') {
        convertedCount++;
      }
    });

    // Calculate conversion rate
    stats.conversionRate = stats.total > 0 
      ? ((convertedCount / stats.total) * 100).toFixed(2)
      : 0;

    setStatistics(stats);
  };

  /**
   * Update filters
   * @param {Object} newFilters - Filter updates
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Reset filters
   */
  const resetFilters = useCallback(() => {
    setFilters({
      status: '',
      source: '',
      stage: '',
      search: '',
      dateFrom: '',
      dateTo: '',
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
      if (cached && cached.length > 0) {
        setLeads(cached);
        setFilteredLeads(cached);
        calculateStatistics(cached);
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
