import { dbState } from "../../services/state/dbState.js";
import { showNotification } from "../notificationEvents.js";
import { generateId } from "../../services/utils/uidGenerator.js";
import { eventBus, EVENTS } from "../eventBus.js";
import userManager from "./userManager.js";
import { syncSingleEntityToBackend } from "../../services/data/initialDataSync.js";
import {
  appendOrganizationRow,
  removeRowById,
  updateRowById,
} from "../../utils/tableRowUtils.js";

export async function handleOrganizationCreate(event) {
  const { dbWorker, isDbReady } = dbState;

  if (!isDbReady || !dbWorker) {
    showNotification("Database not ready yet. Please wait.", "error");
    return;
  }

  const rawData = event.detail.organizationData;

  const organizationData = {
    organization_id: rawData.organization_id || generateId("org"),
    ...rawData,
    created_on: new Date(),
    updatedAt: new Date(),
  };
  
  if (window.isSync) {
    // Online - make API call directly
    try {
      const response = await syncSingleEntityToBackend(
        "organizations",
        organizationData,
        "create",
      );
      if (response && response.organization && response.organization._id) {
        organizationData._id = response.organization._id;
      }

      showNotification("Organization created successfully", "success");
      eventBus.emit(EVENTS.ORGANIZATION_CREATED, { organizationData });
    } catch (error) {
      console.error("Failed to create organization:", error);
      showNotification(
        "Failed to create organization. Please try again.",
        "error",
      );
    }
  } else {
    // Offline - save to IndexedDB only
    dbWorker.postMessage({
      action: "createOrganization",
      organizationData: organizationData,
    });
    showNotification(
      "Organization saved offline. Will sync when you go back online.",
      "info",
    );
    eventBus.emit(EVENTS.ORGANIZATION_CREATED, { organizationData });
  }
}

export async function handleOrganizationUpdate(event) {
  const { dbWorker, isDbReady } = dbState;

  if (!isDbReady || !dbWorker) {
    showNotification("Database not ready yet. Please wait.", "error");
    return;
  }

  const rawData = event.detail.organizationData;

  const organizationData = {
    ...rawData,
    updatedAt: new Date(),
  };
  
  if (window.isSync) {
    // Online - make API call directly
    try {
      await syncSingleEntityToBackend(
        "organizations",
        organizationData,
        "update",
      );

      showNotification("Organization updated successfully", "success");
      eventBus.emit(EVENTS.ORGANIZATION_UPDATED, { organizationData });
    } catch (error) {
      console.error("Failed to update organization:", error);
      showNotification(
        "Failed to update organization. Please try again.",
        "error",
      );
    }
  } else {
    // Offline - update in IndexedDB only
    dbWorker.postMessage({
      action: "updateOrganization",
      organizationData: organizationData,
    });
    showNotification(
      "Organization updated offline. Will sync when you go back online.",
      "info",
    );
    eventBus.emit(EVENTS.ORGANIZATION_UPDATED, { organizationData });
  }
}

export function handleOrganizationCreated(event) {
  showNotification("Organization created successfully!", "success");
  eventBus.emit(EVENTS.WEB_SOCKET_SEND, { message: "Organization created." });

  const currentTab = window.location.pathname;
  if (
    currentTab === "/organizations" &&
    event.detail &&
    event.detail.organizationData
  ) {
    appendOrganizationRow(event.detail.organizationData);
  }
}

export function handleOrganizationUpdated(event) {
  showNotification("Organization updated successfully!", "success");
  eventBus.emit(EVENTS.WEB_SOCKET_SEND, { message: "Organization updated." });
  const currentTab = window.location.pathname;
  if (
    currentTab === "/organizations" &&
    event.detail &&
    event.detail.organizationData
  ) {
    const orgData = event.detail.organizationData;
    updateRowById(
      "organizations-body",
      "data-organization-id",
      orgData.organization_id,
      orgData,
      appendOrganizationRow,
    );
  }
}

export async function handleOrganizationDelete(event) {
  const { dbWorker } = dbState;
  if (!dbWorker) return;
  const id = event.detail.id;
  dbWorker.postMessage({
    action: "deleteOrganization",
    id: id,
  });
  try {
    await syncSingleEntityToBackend(
      "organizations",
      { organization_id: id, _id: id },
      "delete",
    );
    eventBus.emit(EVENTS.ORGANIZATION_DELETED, { id });
  } catch (error) {
    console.error("Failed to sync organization deletion to backend:", error);
    showNotification(
      "Organization deleted locally. Will sync when connection is restored.",
      "warning",
    );
    eventBus.emit(EVENTS.ORGANIZATION_DELETED, { id });
  }
}

export function handleOrganizationDeleted(event) {
  showNotification("Organization deleted successfully!", "success");
  eventBus.emit(EVENTS.WEB_SOCKET_SEND, { message: "Organization deleted." });
  const currentTab = window.location.pathname;
  if (currentTab === "/organizations" && event.detail && event.detail.id) {
    removeRowById(
      "organizations-body",
      "data-organization-id",
      event.detail.id,
    );
  }
}

export function handleOrganizationExport() {
  const progressBar = document.createElement("export-progress");
  const exportDiv = document.querySelector("#export");
  const exportBtn = document.querySelector("#export-organizations");

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
        storeName: "Organizations",
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

export function handleOrganizationClick(e) {
  const { dbWorker } = dbState;

  if (e.target.closest("#editOrganization")) {
    e.preventDefault();
    e.stopImmediatePropagation();

    const editBtn = e.target.closest("#editOrganization");
    const organizationRow = editBtn.closest("tr");
    const organization_id = organizationRow?.getAttribute(
      "data-organization-id",
    );

    if (organization_id) {
      sessionStorage.setItem("organization_id", organization_id);
      const modal = document.getElementById("form-modal");
      if (modal) {
        modal.classList.remove("hidden");
        if (dbWorker) {
          dbWorker.postMessage({
            action: "getOrganizationById",
            id: organization_id,
            storeName: "Organizations",
          });
        }
      }
    }

    const dropdown = editBtn.closest(".dropdown-menu");
    if (dropdown) {
      dropdown.classList.add("hidden");
    }
    return true;
  }

  if (e.target.closest("#deleteOrganization")) {
    e.stopImmediatePropagation();
    e.preventDefault();

    const deleteBtn = e.target.closest("#deleteOrganization");
    const organizationRow = deleteBtn.closest("tr");
    const organization_id = organizationRow?.getAttribute(
      "data-organization-id",
    );

    if (organization_id) {
      if (confirm("Are you sure you want to delete this organization?")) {
        eventBus.emit(EVENTS.ORGANIZATION_DELETE, { id: organization_id });
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

export async function handleOrganizationRefresh() {
  console.log("Inside handle organization refresh");
  const currentTab = window.location.pathname;
  const { dbWorker } = dbState;

  const user = userManager.getUser();
  if (!user) return;
  const { userId, tenantId, role } = user;

  if (currentTab === "/organizations" && dbWorker) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORGANIZATIONS.GET_ALL);
      const orgsData = response.data || response;
      let filteredOrgs = orgsData;
      if (role === "admin") {
        filteredOrgs = orgsData.filter(
          (org) => String(org.tenantId) === String(tenantId),
        );
      } else {
        filteredOrgs = orgsData.filter(
          (org) =>
            String(org.tenantId) === String(tenantId) &&
            String(org.userId) === String(userId),
        );
      }
      dbWorker.postMessage({
        action: "syncData",
        storeName: "Organizations",
        operation: "replaceAll",
        data: filteredOrgs,
      });

      eventBus.emit(EVENTS.DATA_FETCHED, {
        storeName: "Organizations",
        rows: filteredOrgs,
      });
    } catch (error) {
      console.error("Failed to refresh organizations:", error);
      showNotification(
        "Failed to refresh organizations: " + error.message,
        "error",
      );
      dbWorker.postMessage({
        action: "getData",
        storeName: "Organizations",
        filters: { userId, tenantId, role },
      });
    }
  }
}
