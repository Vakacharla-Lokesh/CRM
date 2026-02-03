let filterInstance = null;

export function initializeSmartFilter(leadsData = []) {
  let filterElement = document.querySelector("smart-filter");

  if (!filterElement) {
    console.warn("smart-filter element not found in DOM");
    return null;
  }

  filterInstance = filterElement;
  if (leadsData && leadsData.length > 0) {
    filterInstance.initialize(leadsData);
    console.log("SmartFilter initialized with", leadsData.length, "leads");
  }

  return filterInstance;
}

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

  document.addEventListener("lead:created", (event) => {
    const newLead = event.detail.leadData;
    if (filterInstance && newLead) {
      if (newLead.lead_id) {
        newLead.lead_id = String(newLead.lead_id);
      }
      filterInstance.allLeads.push(newLead);
      filterInstance.buildStatusStructures();
      filterInstance.render();
      filterInstance.attachEventListeners();
      console.log("SmartFilter updated: Lead created", newLead.lead_id);
    }
  });

  document.addEventListener("lead:deleted", (event) => {
    const deletedLeadId = event.detail.id;
    if (filterInstance && deletedLeadId) {
      const idToDelete = String(deletedLeadId);
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

export function getFilterInstance() {
  return filterInstance;
}

export function getFilteredLeadIds() {
  if (!filterInstance) return [];

  if (!filterInstance.selectedStatus) {
    return filterInstance.allLeads.map((lead) => lead.lead_id);
  }

  return Array.from(
    filterInstance.statusLeadsMap.get(filterInstance.selectedStatus),
  );
}

export function getFilterStats() {
  if (!filterInstance) return null;
  return filterInstance.getStatistics();
}

export function debugFilter() {
  if (!filterInstance) {
    console.log("Filter not initialized");
    return;
  }
  filterInstance.logFilterData();
}
