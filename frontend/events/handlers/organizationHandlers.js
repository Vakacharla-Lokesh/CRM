import { dbState } from "../../services/state/dbState.js";
import { showNotification } from "../notificationEvents.js";
import { generateId } from "../../services/utils/uidGenerator.js";
import { eventBus, EVENTS } from "../eventBus.js";
import userManager from "./userManager.js";
import { apiClient, API_ENDPOINTS } from "../../services/api/apiClient.js";

export async function handleOrganizationCreate(event) {
  const { dbWorker, isDbReady } = dbState;

  if (!isDbReady || !dbWorker) {
    showNotification("Database not ready yet. Please wait.", "error");
    return;
  }

  const rawData = event.detail.organizationData;
  
  const organizationData = {
    organization_id: generateId("org"),
    ...rawData,
    created_at: new Date(),
    updated_at: new Date(),
  };
  const apiData = {
    organizationName: rawData.organization_name,
    organizationWebsite: rawData.organization_website_name,
    organizationIndustry: rawData.organization_industry,
  };

  if (rawData.organization_size) {
    apiData.organizationSize = parseInt(rawData.organization_size, 10);
  }

  try {
    const response = await apiClient.post(API_ENDPOINTS.ORGANIZATIONS.CREATE, apiData);

    if (response.organization?._id) {
      organizationData._id = response.organization._id;
    }

    dbWorker.postMessage({
      action: "syncData",
      storeName: "Organizations",
      operation: "insert",
      data: organizationData,
    });

    eventBus.emit(EVENTS.ORGANIZATION_CREATED);
    showNotification("Organization created successfully", "success");
  } catch (error) {
    console.error("Failed to create organization:", error);
    showNotification(
      "Failed to create organization: " + error.message,
      "error",
    );

    dbWorker.postMessage({
      action: "syncData",
      storeName: "Organizations",
      operation: "insert",
      data: organizationData,
    });
  }
}

export async function handleOrganizationUpdate(event) {
  const { dbWorker, isDbReady } = dbState;

  if (!isDbReady || !dbWorker) {
    showNotification("Database not ready yet. Please wait.", "error");
    return;
  }

  const rawData = event.detail.organizationData;
  
  // Data for IndexedDB (snake_case with extra fields)
  const organizationData = {
    ...rawData,
    updated_at: new Date(),
  };

  // Transform data for API (camelCase, only allowed fields)
  const apiData = {};
  
  if (rawData.organization_name) {
    apiData.organizationName = rawData.organization_name;
  }
  if (rawData.organization_website_name) {
    apiData.organizationWebsite = rawData.organization_website_name;
  }
  if (rawData.organization_industry) {
    apiData.organizationIndustry = rawData.organization_industry;
  }
  if (rawData.organization_size) {
    apiData.organizationSize = parseInt(rawData.organization_size, 10);
  }

  try {
    // Use MongoDB _id for API call, not organization_id
    const mongoId = rawData._id || rawData.organization_id;
    
    if (!mongoId) {
      throw new Error("Organization ID is missing");
    }

    // Make API call first
    await apiClient.put(
      API_ENDPOINTS.ORGANIZATIONS.UPDATE(mongoId),
      apiData,
    );

    // Then sync to IndexedDB
    dbWorker.postMessage({
      action: "syncData",
      storeName: "Organizations",
      operation: "update",
      data: organizationData,
    });

    eventBus.emit(EVENTS.ORGANIZATION_UPDATED);
    showNotification("Organization updated successfully", "success");
  } catch (error) {
    console.error("Failed to update organization:", error);
    showNotification(
      "Failed to update organization: " + error.message,
      "error",
    );

    // Still try to update locally
    dbWorker.postMessage({
      action: "syncData",
      storeName: "Organizations",
      operation: "update",
      data: organizationData,
    });
  }
}

export async function handleOrganizationCreated(event) {
  showNotification("Organization created successfully!", "success");
  eventBus.emit(EVENTS.WEB_SOCKET_SEND, { message: "Organization created." });

  const currentTab = window.location.pathname;
  const { dbWorker } = dbState;

  if (currentTab === "/organizations" && dbWorker) {
    const user = userManager.getUser();
    if (!user) return;
    const { user_id, tenant_id, role } = user;

    try {
      // Fetch fresh data from API
      const response = await apiClient.get(API_ENDPOINTS.ORGANIZATIONS.GET_ALL);
      const orgsData = response.data || response;

      // Filter by tenant and user
      let filteredOrgs = orgsData;
      if (role === "admin") {
        filteredOrgs = orgsData.filter(
          (org) => String(org.tenant_id) === String(tenant_id),
        );
      } else {
        filteredOrgs = orgsData.filter(
          (org) =>
            String(org.tenant_id) === String(tenant_id) &&
            String(org.user_id) === String(user_id),
        );
      }

      // Sync to IndexedDB
      dbWorker.postMessage({
        action: "syncData",
        storeName: "Organizations",
        operation: "replaceAll",
        data: filteredOrgs,
      });

      // Emit data fetched event for UI update
      eventBus.emit(EVENTS.DATA_FETCHED, {
        storeName: "Organizations",
        rows: filteredOrgs,
      });
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
      // Fallback to IndexedDB
      dbWorker.postMessage({
        action: "getData",
        storeName: "Organizations",
        filters: { user_id, tenant_id, role },
      });
    }
  }
}

export async function handleOrganizationUpdated(event) {
  showNotification("Organization updated successfully!", "success");
  eventBus.emit(EVENTS.WEB_SOCKET_SEND, { message: "Organization updated." });

  const currentTab = window.location.pathname;
  const { dbWorker } = dbState;

  if (currentTab === "/organizations" && dbWorker) {
    const user = userManager.getUser();
    if (!user) return;
    const { user_id, tenant_id, role } = user;

    try {
      // Fetch fresh data from API
      const response = await apiClient.get(API_ENDPOINTS.ORGANIZATIONS.GET_ALL);
      const orgsData = response.data || response;

      // Filter by tenant and user
      let filteredOrgs = orgsData;
      if (role === "admin") {
        filteredOrgs = orgsData.filter(
          (org) => String(org.tenant_id) === String(tenant_id),
        );
      } else {
        filteredOrgs = orgsData.filter(
          (org) =>
            String(org.tenant_id) === String(tenant_id) &&
            String(org.user_id) === String(user_id),
        );
      }

      // Sync to IndexedDB
      dbWorker.postMessage({
        action: "syncData",
        storeName: "Organizations",
        operation: "replaceAll",
        data: filteredOrgs,
      });

      // Emit data fetched event for UI update
      eventBus.emit(EVENTS.DATA_FETCHED, {
        storeName: "Organizations",
        rows: filteredOrgs,
      });
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
      // Fallback to IndexedDB
      dbWorker.postMessage({
        action: "getData",
        storeName: "Organizations",
        filters: { user_id, tenant_id, role },
      });
    }
  }

  sessionStorage.removeItem("organization_id");
}

export async function handleOrganizationDelete(event) {
  const { dbWorker } = dbState;

  if (!dbWorker) return;

  const id = event.detail.id;

  try {
    // Delete from API first
    await apiClient.delete(API_ENDPOINTS.ORGANIZATIONS.DELETE(id));

    // Then delete from IndexedDB
    dbWorker.postMessage({
      action: "syncData",
      storeName: "Organizations",
      operation: "delete",
      id: id,
    });

    eventBus.emit(EVENTS.ORGANIZATION_DELETED);
  } catch (error) {
    console.error("Failed to delete organization:", error);
    showNotification(
      "Failed to delete organization: " + error.message,
      "error",
    );

    // Still try to delete locally
    dbWorker.postMessage({
      action: "syncData",
      storeName: "Organizations",
      operation: "delete",
      id: id,
    });
  }
}

export async function handleOrganizationDeleted(event) {
  showNotification("Organization deleted successfully!", "success");
  eventBus.emit(EVENTS.WEB_SOCKET_SEND, { message: "Organization deleted." });

  const currentTab = window.location.pathname;
  const { dbWorker } = dbState;

  if (currentTab === "/organizations" && dbWorker) {
    const user = userManager.getUser();
    if (!user) return;
    const { user_id, tenant_id, role } = user;

    try {
      // Fetch fresh data from API
      const response = await apiClient.get(API_ENDPOINTS.ORGANIZATIONS.GET_ALL);
      const orgsData = response.data || response;

      // Filter by tenant and user
      let filteredOrgs = orgsData;
      if (role === "admin") {
        filteredOrgs = orgsData.filter(
          (org) => String(org.tenant_id) === String(tenant_id),
        );
      } else {
        filteredOrgs = orgsData.filter(
          (org) =>
            String(org.tenant_id) === String(tenant_id) &&
            String(org.user_id) === String(user_id),
        );
      }

      // Sync to IndexedDB
      dbWorker.postMessage({
        action: "syncData",
        storeName: "Organizations",
        operation: "replaceAll",
        data: filteredOrgs,
      });

      // Emit data fetched event for UI update
      eventBus.emit(EVENTS.DATA_FETCHED, {
        storeName: "Organizations",
        rows: filteredOrgs,
      });
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
      // Fallback to IndexedDB
      dbWorker.postMessage({
        action: "getData",
        storeName: "Organizations",
        filters: { user_id, tenant_id, role },
      });
    }
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
  const { user_id, tenant_id, role } = user;

  progressBar.onComplete = () => {
    const { dbWorker } = dbState;
    if (dbWorker) {
      dbWorker.postMessage({
        action: "exportData",
        storeName: "Organizations",
        user_id,
        tenant_id,
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
  const { user_id, tenant_id, role } = user;

  if (currentTab === "/organizations" && dbWorker) {
    try {
      // Fetch fresh data from API
      const response = await apiClient.get(API_ENDPOINTS.ORGANIZATIONS.GET_ALL);
      const orgsData = response.data || response;

      // Filter by tenant and user
      let filteredOrgs = orgsData;
      if (role === "admin") {
        filteredOrgs = orgsData.filter(
          (org) => String(org.tenant_id) === String(tenant_id),
        );
      } else {
        filteredOrgs = orgsData.filter(
          (org) =>
            String(org.tenant_id) === String(tenant_id) &&
            String(org.user_id) === String(user_id),
        );
      }

      // Sync to IndexedDB
      dbWorker.postMessage({
        action: "syncData",
        storeName: "Organizations",
        operation: "replaceAll",
        data: filteredOrgs,
      });

      // Emit data fetched event for UI update
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
      // Fallback to IndexedDB
      dbWorker.postMessage({
        action: "getData",
        storeName: "Organizations",
        filters: { user_id, tenant_id, role },
      });
    }
  }
}
