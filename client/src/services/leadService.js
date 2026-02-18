import apiClient from './api';

/**
 * Lead Service
 * API endpoints for lead operations
 */

const leadService = {
  /**
   * Get all leads
   */
  getAllLeads: async () => {
    return apiClient.get('/leads');
  },

  /**
   * Get lead by ID
   */
  getLeadById: async (id) => {
    return apiClient.get(`/leads/${id}`);
  },

  /**
   * Create new lead
   */
  createLead: async (leadData) => {
    return apiClient.post('/leads', leadData);
  },

  /**
   * Update lead
   */
  updateLead: async (id, updates) => {
    return apiClient.put(`/leads/${id}`, updates);
  },

  /**
   * Delete lead
   */
  deleteLead: async (id) => {
    return apiClient.delete(`/leads/${id}`);
  },

  /**
   * Search leads
   */
  searchLeads: async (query) => {
    return apiClient.get(`/leads/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Get lead statistics
   */
  getLeadStats: async () => {
    return apiClient.get('/leads/stats');
  },

  /**
   * Get leads by status
   */
  getLeadsByStatus: async (status) => {
    return apiClient.get(`/leads?status=${encodeURIComponent(status)}`);
  },

  /**
   * Get leads by source
   */
  getLeadsBySource: async (source) => {
    return apiClient.get(`/leads?source=${encodeURIComponent(source)}`);
  },

  /**
   * Get leads by stage
   */
  getLeadsByStage: async (stage) => {
    return apiClient.get(`/leads?stage=${encodeURIComponent(stage)}`);
  },

  /**
   * Bulk update leads
   */
  bulkUpdateLeads: async (leadIds, updates) => {
    return apiClient.post('/leads/bulk-update', { leadIds, updates });
  },

  /**
   * Bulk delete leads
   */
  bulkDeleteLeads: async (leadIds) => {
    return apiClient.post('/leads/bulk-delete', { leadIds });
  },

  /**
   * Export leads
   */
  exportLeads: async (format = 'csv', filters = {}) => {
    const params = new URLSearchParams({ format, ...filters });
    return apiClient.get(`/leads/export?${params.toString()}`);
  },

  /**
   * Import leads
   */
  importLeads: async (file) => {
    return apiClient.upload('/leads/import', file);
  },

  /**
   * Assign lead to user
   */
  assignLead: async (leadId, userId) => {
    return apiClient.patch(`/leads/${leadId}/assign`, { userId });
  },

  /**
   * Convert lead to deal
   */
  convertLead: async (leadId, dealData) => {
    return apiClient.post(`/leads/${leadId}/convert`, dealData);
  },

  /**
   * Add lead note
   */
  addLeadNote: async (leadId, note) => {
    return apiClient.post(`/leads/${leadId}/notes`, { note });
  },

  /**
   * Get lead activity
   */
  getLeadActivity: async (leadId) => {
    return apiClient.get(`/leads/${leadId}/activity`);
  },
};

export default leadService;
