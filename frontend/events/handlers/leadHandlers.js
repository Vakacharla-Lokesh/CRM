import { dbState } from "../../services/state/dbState.js";
import { eventBus, EVENTS } from "../eventBus.js";
import { showNotification } from "../notificationEvents.js";
import userManager from "./userManager.js";
import { syncSingleEntityToBackend } from "../../services/data/initialDataSync.js";
import { appendLeadRow, removeRowById } from "../../utils/tableRowUtils.js";

export async function handleLeadCreate(event) {
  const { dbWorker, isDbReady } = dbState;

  if (!isDbReady || !dbWorker) {
    showNotification("Database not ready yet. Please wait.", "error");
    return;
  }

  const leadData = {
    ...event.detail.leadData,
    createdAt: new Date(),
    updated_at: new Date(),
  };

  if (window.isSync) {
    // Online - make API call directly
    try {
      const response = await syncSingleEntityToBackend(
        "leads",
        leadData,
        "create",
      );
      if (response && response.leadId) {
        leadData.leadId = response.leadId;
      }
      showNotification("Lead created successfully!", "success");
      eventBus.emit(EVENTS.LEAD_CREATED, { leadData });
    } catch (error) {
      console.error("Failed to create lead:", error);
      showNotification(
        "Failed to create lead. Please try again.",
        "error",
      );
    }
  } else {
    // Offline - save to IndexedDB only
    dbWorker.postMessage({
      action: "createLead",
      leadData: leadData,
    });
    showNotification(
      "Lead saved offline. Will sync when you go back online.",
      "info",
    );
    eventBus.emit(EVENTS.LEAD_CREATED, { leadData });
  }
}

export function handleLeadCreated(event) {
  showNotification("Lead created successfully!", "success");

  eventBus.emit(EVENTS.WEB_SOCKET_SEND, { message: "Lead created." });

  const currentTab = window.location.pathname;

  if (currentTab === "/leads" && event.detail && event.detail.leadData) {
    appendLeadRow(event.detail.leadData);
  }
}

export async function handleLeadDelete(event) {
  const { dbWorker } = dbState;

  if (!dbWorker) return;

  const id = event.detail.id;

  if (window.isSync) {
    // Online - make API call directly
    try {
      await syncSingleEntityToBackend("leads", { leadId: id }, "delete");
      showNotification("Lead deleted successfully!", "success");
      eventBus.emit(EVENTS.LEAD_DELETED, { id });
    } catch (error) {
      console.error("Failed to delete lead:", error);
      showNotification(
        "Failed to delete lead. Please try again.",
        "error",
      );
    }
  } else {
    // Offline - delete from IndexedDB only
    dbWorker.postMessage({ action: "deleteLead", id });
    showNotification(
      "Lead deleted locally. Will sync when you go back online.",
      "info",
    );
    eventBus.emit(EVENTS.LEAD_DELETED, { id });
  }
}

export function handleLeadDeleted(event) {
  showNotification("Lead deleted successfully!", "success");

  eventBus.emit(EVENTS.WEB_SOCKET_SEND, { message: "Lead deleted." });
  const currentTab = window.location.pathname;
  if (currentTab === "/leads" && event.detail && event.detail.id) {
    removeRowById("leads-body", "data-lead-id", event.detail.id);
  }
}

export function handleLeadExport() {
  const progressBar = document.createElement("export-progress");
  const exportDiv = document.querySelector("#export");
  const exportBtn = document.querySelector("#export-leads");

  exportBtn.classList.add("hidden");
  exportDiv.appendChild(progressBar);

  const user = userManager.getUser();
  if (!user) return;
  const { userId, tenantId, role } = user;

  progressBar.onComplete = () => {
    const { dbWorker } = dbState;
    if (dbWorker) {
      dbWorker.postMessage({
        action: "exportData",
        storeName: "Leads",
        userId,
        tenantId,
        role,
      });
    }
  };

  progressBar.onCleanup = () => {
    exportBtn.classList.remove("hidden");
  };
}

export function calculateLeadScore() {
  const { dbWorker } = dbState;

  const user = userManager.getUser();
  if (!user) return;
  const { userId, tenantId, role } = user;

  if (dbWorker) {
    dbWorker.postMessage({
      action: "calculateScore",
      userId,
      tenantId,
      role,
    });
  }
}

export function handleLeadClick(e) {
  if (e.target.closest("#editLead")) {
    e.preventDefault();
    e.stopImmediatePropagation();

    const editBtn = e.target.closest("#editLead");
    const leadRow = editBtn.closest("tr");
    const leadId = leadRow?.getAttribute("data-lead-id");

    sessionStorage.setItem("leadId", leadId);

    const dropdown = editBtn.closest(".dropdown-menu");
    if (dropdown) {
      dropdown.classList.add("hidden");
    }

    window.location.href = "/leadDetails";
    return true;
  }

  if (e.target.closest("#deleteLead")) {
    e.preventDefault();
    e.stopImmediatePropagation();

    const deleteBtn = e.target.closest("#deleteLead");
    const leadRow = deleteBtn.closest("tr");
    const leadId = leadRow?.getAttribute("data-lead-id");

    if (leadId) {
      if (confirm("Are you sure you want to delete this lead?")) {
        import("../eventBus.js").then(({ eventBus, EVENTS }) => {
          eventBus.emit(EVENTS.LEAD_DELETE, { id: leadId });
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

export function handleLeadRefresh() {
  console.log("Inside handle Refresh");
  const currentTab = window.location.pathname;
  const { dbWorker } = dbState;

  const user = userManager.getUser();
  if (!user) return;
  const { userId, tenantId, role } = user;

  if (currentTab === "/leads" && dbWorker) {
    dbWorker.postMessage({
      action: "getAllLeads",
      userId,
      tenantId,
      role,
    });
  }
}
