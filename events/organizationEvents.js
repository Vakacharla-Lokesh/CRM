import { showNotification } from "./notificationEvents.js";
import { exportDb } from "../services/exportDb.js";

let dbWorker = null;
let isDbReady = false;

export function initializeOrganizationEventDependencies(worker, dbReady) {
  dbWorker = worker;
  isDbReady = dbReady;
}

export function setDbReady(ready) {
  isDbReady = ready;
}

export function handleOrganizationCreated(event) {
  showNotification("Organization created successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  if (currentTab === "/organizations" && dbWorker) {
    dbWorker.postMessage({ action: "getAllOrganizations" });
  }
}

export function handleOrganizationDelete(event) {
  if (!dbWorker) return;

  const id = event.detail.id;
  dbWorker.postMessage({ action: "deleteOrganization", id });
}

export function handleOrganizationDeleted(event) {
  showNotification("Organization deleted successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  if (currentTab === "/organizations" && dbWorker) {
    dbWorker.postMessage({ action: "getAllOrganizations" });
  }
}

export function handleOrganizationExport(event) {
  exportDb("Organizations");
}
