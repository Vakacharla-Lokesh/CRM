export function handleLeadCreate(event) {
  let { dbWorker, isDbReady } = event.details;

  if (!isDbReady || !dbWorker) {
    showNotification("Database not ready yet. Please wait.", "error");
    return;
  }

  const leadData = {
    lead_id: generateId("lead"),
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
  let dbWorker = event.details.dbWorker;
  showNotification("Lead created successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  if (currentTab === "/leads" && dbWorker) {
    dbWorker.postMessage({ action: "getAllLeads" });
  }
}

export function handleLeadDelete(event) {
  let dbWorker = event.details.dbWorker;
  if (!dbWorker) return;

  const id = event.detail.id;
  dbWorker.postMessage({ action: "deleteLead", id });
}

export function handleLeadDeleted(event) {
  let dbWorker = event.details.dbWorker;
  showNotification("Lead deleted successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  if (currentTab === "/leads" && dbWorker) {
    dbWorker.postMessage({ action: "getAllLeads" });
  }
}
