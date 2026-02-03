let filterInstance = null;

export function initializeSmartFilter(leadsData = []) {
  // Get filter instance - it should already exist in the DOM from leads.html
  let filterElement = document.querySelector("smart-filter");

  if (!filterElement) {
    console.warn("smart-filter element not found in DOM");
    return null;
  }

  filterInstance = filterElement;

  // Initialize with current leads if provided
  if (leadsData && leadsData.length > 0) {
    filterInstance.initialize(leadsData);
    console.log("SmartFilter initialized with", leadsData.length, "leads");
  }

  return filterInstance;
}

/**
 * Listen to lead population events and update filter
 */
export function setupFilterEventListeners() {
  document.addEventListener("leadsPopulated", (event) => {
    const filterElement = document.querySelector("smart-filter");
    if (filterElement) {
      filterInstance = filterElement;
      filterInstance.updateLeads(event.detail.leads || []);
      console.log("SmartFilter updated with", event.detail.leads?.length || 0, "leads");
    } else {
      console.warn("smart-filter element not found when leadsPopulated event fired");
    }
  });

  // Listen to lead creation events (from eventBus)
  document.addEventListener("lead:created", (event) => {
    const newLead = event.detail.leadData;
    if (filterInstance && newLead) {
      // Ensure lead_id is string
      if (newLead.lead_id) {
        newLead.lead_id = String(newLead.lead_id);
      }
      // Add to in-memory leads
      filterInstance.allLeads.push(newLead);
      filterInstance.buildStatusStructures();
      filterInstance.render();
      filterInstance.attachEventListeners();
      console.log("SmartFilter updated: Lead created", newLead.lead_id);
    }
  });

  // Listen to lead deletion events
  document.addEventListener("lead:deleted", (event) => {
    const deletedLeadId = event.detail.id;
    if (filterInstance && deletedLeadId) {
      // Ensure consistent string comparison
      const idToDelete = String(deletedLeadId);
      // Remove from in-memory leads
      filterInstance.allLeads = filterInstance.allLeads.filter(
        (lead) => String(lead.lead_id) !== idToDelete
      );
      filterInstance.buildStatusStructures();
      filterInstance.render();
      filterInstance.attachEventListeners();
      console.log("SmartFilter updated: Lead deleted", deletedLeadId);
    }
  });
}

/**
 * Get current filter instance
 */
export function getFilterInstance() {
  return filterInstance;
}

/**
 * Helper function to get filtered lead IDs
 * Useful for export or other operations
 */
export function getFilteredLeadIds() {
  if (!filterInstance) return [];

  if (!filterInstance.selectedStatus) {
    return filterInstance.allLeads.map((lead) => lead.lead_id);
  }

  return Array.from(
    filterInstance.statusLeadsMap.get(filterInstance.selectedStatus),
  );
}

/**
 * Helper function to get filter statistics
 */
export function getFilterStats() {
  if (!filterInstance) return null;
  return filterInstance.getStatistics();
}

/**
 * Debug function to log all filter data
 */
export function debugFilter() {
  if (!filterInstance) {
    console.log("Filter not initialized");
    return;
  }
  filterInstance.logFilterData();
}
