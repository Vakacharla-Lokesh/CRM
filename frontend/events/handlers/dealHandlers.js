import { dbState } from "../../services/state/dbState.js";
import { eventBus, EVENTS } from "../eventBus.js";
import { showNotification } from "../notificationEvents.js";
import userManager from "./userManager.js";
import { apiClient, API_ENDPOINTS } from "../../services/api/apiClient.js";

export async function handleDealCreate(event) {
  const { dbWorker, isDbReady } = dbState;

  if (!isDbReady || !dbWorker) {
    showNotification("Database not ready yet. Please wait.", "error");
    return;
  }

  const dealData = {
    ...event.detail.dealData,
  };

  try {
    // Make API call first
    await apiClient.post(API_ENDPOINTS.DEALS.CREATE, dealData);
    
    // Then sync to IndexedDB
    dbWorker.postMessage({
      action: "syncData",
      storeName: "Deals",
      operation: "insert",
      data: dealData,
    });
    
    eventBus.emit(EVENTS.DEAL_CREATED);
  } catch (error) {
    console.error("Failed to create deal:", error);
    showNotification("Failed to create deal: " + error.message, "error");
    
    // Still try to save locally
    dbWorker.postMessage({
      action: "syncData",
      storeName: "Deals",
      operation: "insert",
      data: dealData,
    });
  }
}

export async function handleDealUpdate(event) {
  const { dbWorker, isDbReady } = dbState;

  if (!isDbReady || !dbWorker) {
    showNotification("Database not ready yet. Please wait.", "error");
    return;
  }

  const dealData = {
    ...event.detail.dealData,
    modified_on: new Date(),
  };

  try {
    // Make API call first
    await apiClient.put(
      API_ENDPOINTS.DEALS.UPDATE(dealData.deal_id),
      dealData
    );
    
    // Then sync to IndexedDB
    dbWorker.postMessage({
      action: "syncData",
      storeName: "Deals",
      operation: "update",
      data: dealData,
    });
    
    eventBus.emit(EVENTS.DEAL_UPDATED);
  } catch (error) {
    console.error("Failed to update deal:", error);
    showNotification("Failed to update deal: " + error.message, "error");
    
    // Still try to update locally
    dbWorker.postMessage({
      action: "syncData",
      storeName: "Deals",
      operation: "update",
      data: dealData,
    });
  }
}

export async function handleDealCreated(event) {
  showNotification("Deal created successfully!", "success");

  eventBus.emit(EVENTS.WEB_SOCKET_SEND, { message: "Deal created." });

  const currentTab = window.location.pathname;
  const { dbWorker } = dbState;

  if (currentTab === "/deals" && dbWorker) {
    const user = userManager.getUser();
    if (!user) return;
    const { user_id, tenant_id, role } = user;
    
    try {
      // Fetch fresh data from API
      const response = await apiClient.get(API_ENDPOINTS.DEALS.GET_ALL);
      const dealsData = response.data || response;

      // Filter by tenant and user
      let filteredDeals = dealsData;
      if (role === "admin") {
        filteredDeals = dealsData.filter(
          (deal) => String(deal.tenant_id) === String(tenant_id)
        );
      } else {
        filteredDeals = dealsData.filter(
          (deal) =>
            String(deal.tenant_id) === String(tenant_id) &&
            String(deal.user_id) === String(user_id)
        );
      }

      // Sync to IndexedDB
      dbWorker.postMessage({
        action: "syncData",
        storeName: "Deals",
        operation: "replaceAll",
        data: filteredDeals,
      });

      // Emit data fetched event for UI update
      eventBus.emit(EVENTS.DATA_FETCHED, {
        storeName: "Deals",
        rows: filteredDeals,
      });
    } catch (error) {
      console.error("Failed to fetch deals:", error);
      // Fallback to IndexedDB
      dbWorker.postMessage({
        action: "getData",
        storeName: "Deals",
        filters: { user_id, tenant_id, role },
      });
    }
  }
}

export async function handleDealUpdated(event) {
  showNotification("Deal updated successfully!", "success");
  eventBus.emit(EVENTS.WEB_SOCKET_SEND, { message: "Deal updated." });

  const currentTab = window.location.pathname;
  const { dbWorker } = dbState;

  if (currentTab === "/deals" && dbWorker) {
    const user = userManager.getUser();
    if (!user) return;
    const { user_id, tenant_id, role } = user;
    
    try {
      // Fetch fresh data from API
      const response = await apiClient.get(API_ENDPOINTS.DEALS.GET_ALL);
      const dealsData = response.data || response;

      // Filter by tenant and user
      let filteredDeals = dealsData;
      if (role === "admin") {
        filteredDeals = dealsData.filter(
          (deal) => String(deal.tenant_id) === String(tenant_id)
        );
      } else {
        filteredDeals = dealsData.filter(
          (deal) =>
            String(deal.tenant_id) === String(tenant_id) &&
            String(deal.user_id) === String(user_id)
        );
      }

      // Sync to IndexedDB
      dbWorker.postMessage({
        action: "syncData",
        storeName: "Deals",
        operation: "replaceAll",
        data: filteredDeals,
      });

      // Emit data fetched event for UI update
      eventBus.emit(EVENTS.DATA_FETCHED, {
        storeName: "Deals",
        rows: filteredDeals,
      });
    } catch (error) {
      console.error("Failed to fetch deals:", error);
      // Fallback to IndexedDB
      dbWorker.postMessage({
        action: "getData",
        storeName: "Deals",
        filters: { user_id, tenant_id, role },
      });
    }
  }
}

export async function handleDealDelete(event) {
  const { dbWorker } = dbState;

  if (!dbWorker) return;

  const id = event.detail.id;
  
  try {
    // Delete from API first
    await apiClient.delete(API_ENDPOINTS.DEALS.DELETE(id));
    
    // Then delete from IndexedDB
    dbWorker.postMessage({
      action: "syncData",
      storeName: "Deals",
      operation: "delete",
      id: id,
    });
    
    eventBus.emit(EVENTS.DEAL_DELETED);
  } catch (error) {
    console.error("Failed to delete deal:", error);
    showNotification("Failed to delete deal: " + error.message, "error");
    
    // Still try to delete locally
    dbWorker.postMessage({
      action: "syncData",
      storeName: "Deals",
      operation: "delete",
      id: id,
    });
  }
}

export async function handleDealDeleted(event) {
  showNotification("Deal deleted successfully!", "success");
  eventBus.emit(EVENTS.WEB_SOCKET_SEND, { message: "Deal deleted." });

  const currentTab = window.location.pathname;
  const { dbWorker } = dbState;

  if (currentTab === "/deals" && dbWorker) {
    const user = userManager.getUser();
    if (!user) return;
    const { user_id, tenant_id, role } = user;
    
    try {
      // Fetch fresh data from API
      const response = await apiClient.get(API_ENDPOINTS.DEALS.GET_ALL);
      const dealsData = response.data || response;

      // Filter by tenant and user
      let filteredDeals = dealsData;
      if (role === "admin") {
        filteredDeals = dealsData.filter(
          (deal) => String(deal.tenant_id) === String(tenant_id)
        );
      } else {
        filteredDeals = dealsData.filter(
          (deal) =>
            String(deal.tenant_id) === String(tenant_id) &&
            String(deal.user_id) === String(user_id)
        );
      }

      // Sync to IndexedDB
      dbWorker.postMessage({
        action: "syncData",
        storeName: "Deals",
        operation: "replaceAll",
        data: filteredDeals,
      });

      // Emit data fetched event for UI update
      eventBus.emit(EVENTS.DATA_FETCHED, {
        storeName: "Deals",
        rows: filteredDeals,
      });
    } catch (error) {
      console.error("Failed to fetch deals:", error);
      // Fallback to IndexedDB
      dbWorker.postMessage({
        action: "getData",
        storeName: "Deals",
        filters: { user_id, tenant_id, role },
      });
    }
  }
}

export function handleDealExport() {
  const progressBar = document.createElement("export-progress");
  const exportDiv = document.querySelector("#export");
  const exportBtn = document.querySelector("#export-deals");

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
        storeName: "Deals",
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

export function handleDealClick(e) {
  // console.log("Inside handledealClick: ");
  const { dbWorker } = dbState;

  if (e.target.closest("#editDeal")) {
    console.log("Inside if statement of editdeal: ");
    e.preventDefault();
    // e.stopImmediatePropagation();
    const editBtn = e.target.closest("#editDeal");
    const dealRow = editBtn.closest("tr");
    const deal_id = dealRow?.getAttribute("data-deal-id");

    if (deal_id) {
      sessionStorage.setItem("deal_id", deal_id);

      const modal = document.getElementById("deal-form-modal");

      if (modal) {
        modal.classList.remove("hidden");

        const dealModal = document.querySelector("deal-modal");
        if (dealModal) {
          dbWorker.postMessage({
            action: "getDealById",
            id: deal_id,
            storeName: "Deals",
          });
        }
      }
    }
    return true;
  }

  if (e.target.closest("#deleteDeal")) {
    e.preventDefault();
    e.stopImmediatePropagation();

    const deleteBtn = e.target.closest("#deleteDeal");
    const dealRow = deleteBtn.closest("tr");
    const deal_id = dealRow?.getAttribute("data-deal-id");

    if (deal_id) {
      if (confirm("Are you sure you want to delete this deal?")) {
        import("../eventBus.js").then(({ eventBus, EVENTS }) => {
          eventBus.emit(EVENTS.DEAL_DELETE, { id: deal_id });
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

export async function handleDealRefresh() {
  console.log("Inside handle deal refresh");
  const currentTab = window.location.pathname;
  const { dbWorker } = dbState;

  const user = userManager.getUser();
  if (!user) return;
  const { user_id, tenant_id, role } = user;

  if (currentTab === "/deals" && dbWorker) {
    try {
      // Fetch fresh data from API
      const response = await apiClient.get(API_ENDPOINTS.DEALS.GET_ALL);
      const dealsData = response.data || response;

      // Filter by tenant and user
      let filteredDeals = dealsData;
      if (role === "admin") {
        filteredDeals = dealsData.filter(
          (deal) => String(deal.tenant_id) === String(tenant_id)
        );
      } else {
        filteredDeals = dealsData.filter(
          (deal) =>
            String(deal.tenant_id) === String(tenant_id) &&
            String(deal.user_id) === String(user_id)
        );
      }

      // Sync to IndexedDB
      dbWorker.postMessage({
        action: "syncData",
        storeName: "Deals",
        operation: "replaceAll",
        data: filteredDeals,
      });

      // Emit data fetched event for UI update
      eventBus.emit(EVENTS.DATA_FETCHED, {
        storeName: "Deals",
        rows: filteredDeals,
      });
    } catch (error) {
      console.error("Failed to refresh deals:", error);
      showNotification("Failed to refresh deals: " + error.message, "error");
      // Fallback to IndexedDB
      dbWorker.postMessage({
        action: "getData",
        storeName: "Deals",
        filters: { user_id, tenant_id, role },
      });
    }
  }
}
