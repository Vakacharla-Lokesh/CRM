export function handleLeadCreate(event) {
  if (!isDbReady || !dbWorker) {
    showNotification("Database not ready yet. Please wait.", "error");
    return;
  }

  const leadData = {
    lead_id: Date.now(),
    ...event.detail.leadData,
    created_on: new Date(),
    modified_on: new Date(),
  };

  dbWorker.postMessage({
    action: "createLead",
    leadData,
  });
}

export function handleLeadCreated(event) {
  showNotification("Lead created successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  if (currentTab === "/leads" && dbWorker) {
    dbWorker.postMessage({ action: "getAllLeads" });
  }
}

export function handleLeadDelete(event) {
  if (!dbWorker) return;

  const id = Number(event.detail.id);
  dbWorker.postMessage({ action: "deleteLead", id });
}

export function handleLeadDeleted(event) {
  showNotification("Lead deleted successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  if (currentTab === "/leads" && dbWorker) {
    dbWorker.postMessage({ action: "getAllLeads" });
  }
}