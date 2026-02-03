/**
 * Offline Manager - Handles offline data queue and synchronization
 * Uses localStorage for offline queue, syncs to IndexedDB when online
 */

export const offlineManager = {
  /**
   * Check if application is in online mode
   * @returns {boolean} True if online, false if offline
   */
  isOnline() {
    return window.isSync === true;
  },

  /**
   * Save data to offline queue
   * @param {string} type - Data type: 'leads', 'organizations', 'deals', 'users'
   * @param {object} data - Data object to save
   */
  saveOffline(type, data) {
    try {
      const key = `offline_${type}`;
      const existing = localStorage.getItem(key);
      const queue = existing ? JSON.parse(existing) : [];
      
      queue.push(data);
      localStorage.setItem(key, JSON.stringify(queue));
      
      console.log(`[OfflineManager] Saved ${type} to offline queue`, data);
    } catch (error) {
      console.error(`[OfflineManager] Error saving ${type}:`, error);
    }
  },

  /**
   * Get offline data for a specific type
   * @param {string} type - Data type: 'leads', 'organizations', 'deals', 'users'
   * @returns {Array} Array of offline items
   */
  getOfflineData(type) {
    try {
      const key = `offline_${type}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`[OfflineManager] Error reading ${type}:`, error);
      return [];
    }
  },

  /**
   * Clear offline data for a specific type
   * @param {string} type - Data type: 'leads', 'organizations', 'deals', 'users'
   */
  clearOfflineData(type) {
    try {
      const key = `offline_${type}`;
      localStorage.removeItem(key);
      console.log(`[OfflineManager] Cleared ${type} offline queue`);
    } catch (error) {
      console.error(`[OfflineManager] Error clearing ${type}:`, error);
    }
  },

  /**
   * Clear all offline data
   */
  clearAll() {
    const types = ['leads', 'organizations', 'deals', 'users'];
    types.forEach(type => this.clearOfflineData(type));
  },

  /**
   * Get total count of offline items across all types
   * @returns {number} Total count
   */
  getTotalOfflineCount() {
    const types = ['leads', 'organizations', 'deals', 'users'];
    return types.reduce((total, type) => {
      return total + this.getOfflineData(type).length;
    }, 0);
  },

  /**
   * Sync all offline data to IndexedDB via EventBus
   * @param {object} eventBus - EventBus instance
   * @param {object} EVENTS - Events constants
   */
  syncAll(eventBus, EVENTS) {
    if (!this.isOnline()) {
      console.warn('[OfflineManager] Cannot sync while offline');
      return;
    }

    console.log('[OfflineManager] Starting sync of all offline data...');

    // Sync leads
    const leads = this.getOfflineData('leads');
    leads.forEach(leadData => {
      // Remove offline flags before syncing
      const cleanData = { ...leadData };
      delete cleanData._offline;
      delete cleanData._timestamp;
      
      eventBus.emit(EVENTS.LEAD_CREATE, { leadData: cleanData });
    });
    if (leads.length > 0) {
      this.clearOfflineData('leads');
      console.log(`[OfflineManager] Synced ${leads.length} leads`);
    }

    // Sync organizations
    const orgs = this.getOfflineData('organizations');
    orgs.forEach(organizationData => {
      const cleanData = { ...organizationData };
      delete cleanData._offline;
      delete cleanData._timestamp;
      
      eventBus.emit(EVENTS.ORGANIZATION_CREATE, { organizationData: cleanData });
    });
    if (orgs.length > 0) {
      this.clearOfflineData('organizations');
      console.log(`[OfflineManager] Synced ${orgs.length} organizations`);
    }

    // Sync deals
    const deals = this.getOfflineData('deals');
    deals.forEach(dealData => {
      const cleanData = { ...dealData };
      delete cleanData._offline;
      delete cleanData._timestamp;
      
      eventBus.emit(EVENTS.DEAL_CREATE, { dealData: cleanData });
    });
    if (deals.length > 0) {
      this.clearOfflineData('deals');
      console.log(`[OfflineManager] Synced ${deals.length} deals`);
    }

    // Sync users
    const users = this.getOfflineData('users');
    users.forEach(userData => {
      const cleanData = { ...userData };
      delete cleanData._offline;
      delete cleanData._timestamp;
      
      eventBus.emit(EVENTS.USER_CREATE, { userData: cleanData });
    });
    if (users.length > 0) {
      this.clearOfflineData('users');
      console.log(`[OfflineManager] Synced ${users.length} users`);
    }

    console.log('[OfflineManager] Sync completed');
  }
};
