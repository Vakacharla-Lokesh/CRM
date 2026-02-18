import apiClient from './api';
import type { Lead } from '../types';

/**
 * Lead Service
 * API endpoints for lead operations
 */

interface LeadStats {
  total: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  byStage: Record<string, number>;
}

interface LeadActivity {
  id: string;
  leadId: string;
  type: string;
  description: string;
  userId: string;
  createdAt: string;
}

const leadService = {
  /**
   * Get all leads
   */
  getAllLeads: async (): Promise<Lead[]> => {
    return apiClient.get<Lead[]>('/leads');
  },

  /**
   * Get lead by ID
   */
  getLeadById: async (id: string): Promise<Lead> => {
    return apiClient.get<Lead>(`/leads/${id}`);
  },

  /**
   * Create new lead
   */
  createLead: async (leadData: Partial<Lead>): Promise<Lead> => {
    return apiClient.post<Lead>('/leads', leadData);
  },

  /**
   * Update lead
   */
  updateLead: async (id: string, updates: Partial<Lead>): Promise<Lead> => {
    return apiClient.put<Lead>(`/leads/${id}`, updates);
  },

  /**
   * Delete lead
   */
  deleteLead: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/leads/${id}`);
  },

  /**
   * Search leads
   */
  searchLeads: async (query: string): Promise<Lead[]> => {
    return apiClient.get<Lead[]>(`/leads/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Get lead statistics
   */
  getLeadStats: async (): Promise<LeadStats> => {
    return apiClient.get<LeadStats>('/leads/stats');
  },

  /**
   * Get leads by status
   */
  getLeadsByStatus: async (status: string): Promise<Lead[]> => {
    return apiClient.get<Lead[]>(`/leads?status=${encodeURIComponent(status)}`);
  },

  /**
   * Get leads by source
   */
  getLeadsBySource: async (source: string): Promise<Lead[]> => {
    return apiClient.get<Lead[]>(`/leads?source=${encodeURIComponent(source)}`);
  },

  /**
   * Get leads by stage
   */
  getLeadsByStage: async (stage: string): Promise<Lead[]> => {
    return apiClient.get<Lead[]>(`/leads?stage=${encodeURIComponent(stage)}`);
  },

  /**
   * Bulk update leads
   */
  bulkUpdateLeads: async (leadIds: string[], updates: Partial<Lead>): Promise<{ message: string; updated: number }> => {
    return apiClient.post<{ message: string; updated: number }>('/leads/bulk-update', { leadIds, updates });
  },

  /**
   * Bulk delete leads
   */
  bulkDeleteLeads: async (leadIds: string[]): Promise<{ message: string; deleted: number }> => {
    return apiClient.post<{ message: string; deleted: number }>('/leads/bulk-delete', { leadIds });
  },

  /**
   * Export leads
   */
  exportLeads: async (format: string = 'csv', filters: Record<string, string> = {}): Promise<Blob> => {
    const params = new URLSearchParams({ format, ...filters });
    return apiClient.get<Blob>(`/leads/export?${params.toString()}`);
  },

  /**
   * Import leads
   */
  importLeads: async (file: File | Blob): Promise<{ message: string; imported: number }> => {
    return apiClient.upload<{ message: string; imported: number }>('/leads/import', file);
  },

  /**
   * Assign lead to user
   */
  assignLead: async (leadId: string, userId: string): Promise<Lead> => {
    return apiClient.patch<Lead>(`/leads/${leadId}/assign`, { userId });
  },

  /**
   * Convert lead to deal
   */
  convertLead: async (leadId: string, dealData: unknown): Promise<{ message: string; dealId: string }> => {
    return apiClient.post<{ message: string; dealId: string }>(`/leads/${leadId}/convert`, dealData);
  },

  /**
   * Add lead note
   */
  addLeadNote: async (leadId: string, note: string): Promise<{ message: string; noteId: string }> => {
    return apiClient.post<{ message: string; noteId: string }>(`/leads/${leadId}/notes`, { note });
  },

  /**
   * Get lead activity
   */
  getLeadActivity: async (leadId: string): Promise<LeadActivity[]> => {
    return apiClient.get<LeadActivity[]>(`/leads/${leadId}/activity`);
  },
};

export default leadService;
