import { useState, useEffect, useCallback, useMemo } from "react";
import type { Lead, LeadStatus, LeadSource } from "../types";
import { leadService } from "../services";
import { useAsync } from "./useAsync";
import { useIndexedDB } from "./useIndexedDB";

interface Filters {
  status: LeadStatus | "";
  source: LeadSource | "";
  stage: string;
  search: string;
  dateFrom: string;
  dateTo: string;
}

export const useLeadData = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
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
  const { updateItem, deleteItem } = useIndexedDB("leads");

  const applyFilters = useCallback(() => {
    let filtered = [...leads];

    if (filters.status) {
      filtered = filtered.filter((lead) => lead.leadStatus === filters.status);
    }

    if (filters.source) {
      filtered = filtered.filter((lead) => lead.leadSource === filters.source);
    }

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

  const fetchLeads = useCallback(async () => {
    return executeAsync(async () => {
      const data = await leadService.getAllLeads();
      setLeads(data);
      setFilteredLeads(data);

      for (const lead of data) {
        try {
          await updateItem(lead._id, { ...lead, id: lead._id });
        } catch (error) {
          console.warn("Failed to persist lead to IndexedDB:", error);
        }
      }

      return data;
    });
  }, [executeAsync, updateItem]);

  const fetchLeadById = useCallback(
    async (id: string) => {
      return executeAsync(async () => {
        const lead = await leadService.getLeadById(id);
        return lead;
      });
    },
    [executeAsync],
  );

  const createLead = useCallback(
    async (leadData: Partial<Lead>) => {
      return executeAsync(async () => {
        const newLead = await leadService.createLead(leadData);
        setLeads((prev) => [...prev, newLead]);
        try {
          await updateItem(newLead._id, { ...newLead, id: newLead._id });
        } catch (error) {
          console.warn("Failed to persist lead to IndexedDB:", error);
        }
        await fetchLeads();
        return newLead;
      });
    },
    [executeAsync, updateItem, fetchLeads],
  );

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

  const searchLeads = useCallback(
    async (query: string) => {
      return executeAsync(async () => {
        const results = await leadService.searchLeads(query);
        return results;
      });
    },
    [executeAsync],
  );

  const updateFilter = useCallback((key: keyof Filters, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

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

  const bulkUpdateLeads = useCallback(
    async (ids: string[], updates: Partial<Lead>) => {
      return executeAsync(async () => {
        await leadService.bulkUpdateLeads(ids, updates);
        const updatedLeads = ids
          .map((id) => {
            const lead = leads.find((l) => l._id === id);
            return lead ? { ...lead, ...updates } : null;
          })
          .filter(Boolean) as Lead[];

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    applyFilters();
  }, [applyFilters]);

  const totalPages = useMemo(
    () => Math.ceil(filteredLeads.length / 20),
    [filteredLeads],
  );

  return {
    // Data
    leads,
    filteredLeads,
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
