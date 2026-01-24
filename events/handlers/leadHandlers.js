import { dbState } from "../../services/dbState.js";
import { showNotification } from "../notificationEvents.js";
import { exportDb } from "../../services/exportDb.js";
import { generateId } from "../../services/uidGenerator.js";

export function handleLeadCreate(event) {
  const { dbWorker, isDbReady } = dbState;

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
  const { dbWorker } = dbState;

  if (currentTab === "/leads" && dbWorker) {
    dbWorker.postMessage({ action: "getAllLeads" });
  }
}

export function handleLeadDelete(event) {
  const { dbWorker } = dbState;

  if (!dbWorker) return;

  const id = event.detail.id;
  dbWorker.postMessage({ action: "deleteLead", id });
}

export function handleLeadDeleted(event) {
  showNotification("Lead deleted successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  const { dbWorker } = dbState;

  if (currentTab === "/leads" && dbWorker) {
    dbWorker.postMessage({ action: "getAllLeads" });
  }
}

export function handleLeadExport() {
  exportDb("Leads");
}

export function calculateLeadScore() {
  const { dbWorker } = dbState;

  if (dbWorker) {
    dbWorker.postMessage({ action: "calculateScore" });
  }
}

// Click handler for lead actions
export function handleLeadClick(e) {
  const { dbWorker } = dbState;

  if (e.target.closest("#editLead")) {
    e.preventDefault();
    e.stopImmediatePropagation();

    const editBtn = e.target.closest("#editLead");
    const leadRow = editBtn.closest("tr");
    const lead_id = leadRow?.getAttribute("data-lead-id");

    sessionStorage.setItem("lead_id", lead_id);
    sessionStorage.setItem("currentTab", "/leadDetails");

    const dropdown = editBtn.closest(".dropdown-menu");
    if (dropdown) {
      dropdown.classList.add("hidden");
    }

    if (window.router && window.router.loadRoute) {
      window.router.loadRoute("/leadDetails");
    }
    return true;
  }

  if (e.target.closest("#deleteLead")) {
    e.preventDefault();
    e.stopImmediatePropagation();

    const deleteBtn = e.target.closest("#deleteLead");
    const leadRow = deleteBtn.closest("tr");
    const lead_id = leadRow?.getAttribute("data-lead-id");

    if (lead_id) {
      if (confirm("Are you sure you want to delete this lead?")) {
        import("../eventBus.js").then(({ eventBus, EVENTS }) => {
          eventBus.emit(EVENTS.LEAD_DELETE, { id: lead_id });
        });
      }
    }

    const dropdown = deleteBtn.closest(".dropdown-menu");
    if (dropdown) {
      dropdown.classList.add("hidden");
    }
    return true;
  }

  return false;
}
