import { showNotification } from "./notificationEvents.js";
import { exportDb } from "../services/exportDb.js";

let dbWorker = null;
let isDbReady = false;

export function initializeLeadEventDependencies(worker, dbReady) {
  dbWorker = worker;
  isDbReady = dbReady;
}

export function setDbReady(ready) {
  isDbReady = ready;
}

export function handleLeadCreate(event) {
  if (!isDbReady || !dbWorker) {
    showNotification("Database not ready yet. Please wait.", "error");
    return;
  }

  const leadData = {
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

  const id = event.detail.id;
  dbWorker.postMessage({ action: "deleteLead", id });
}

export function handleLeadDeleted(event) {
  showNotification("Lead deleted successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  if (currentTab === "/leads" && dbWorker) {
    dbWorker.postMessage({ action: "getAllLeads" });
  }
}

export function handleLeadExport(event) {
  exportDb("Leads");
}

export function calculateScore() {
  if (dbWorker) {
    dbWorker.postMessage({ action: "calculateScore" });
  }
}
