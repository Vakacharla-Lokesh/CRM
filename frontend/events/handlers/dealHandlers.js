import { dbState } from "../../services/state/dbState.js";
import { eventBus, EVENTS } from "../eventBus.js";
import { showNotification } from "../notificationEvents.js";
import userManager from "./userManager.js";
import { syncSingleEntityToBackend } from "../../services/data/initialDataSync.js";
import { appendDealRow, removeRowById, updateRowById } from "../../utils/tableRowUtils.js";

export async function handleDealCreate(event) {
  const { dbWorker, isDbReady } = dbState;

  if (!isDbReady || !dbWorker) {
    showNotification("Database not ready yet. Please wait.", "error");
    return;
  }

  const dealData = {
    ...event.detail.dealData,
  };

  // 1. First, save to IndexedDB
  dbWorker.postMessage({
    action: "createDeal",
    dealData: dealData,
  });
  
  // 2. Then try to sync to backend
  try {
    const response = await syncSingleEntityToBackend("deals", dealData, "create");
    
    // If backend returns an ID, update the local record
    if (response && response.deal_id) {
      dealData.deal_id = response.deal_id;
    }
    
    eventBus.emit(EVENTS.DEAL_CREATED, { dealData });
  } catch (error) {
    console.error("Failed to sync deal to backend:", error);
    showNotification("Deal saved offline. Will sync when connection is restored.", "warning");
    
    // Still emit created event so UI updates
    eventBus.emit(EVENTS.DEAL_CREATED, { dealData });
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

  // 1. First, update in IndexedDB
  dbWorker.postMessage({
    action: "updateDeal",
    dealData: dealData,
  });
  
  // 2. Then try to sync to backend
  try {
    await syncSingleEntityToBackend("deals", dealData, "update");
    
    eventBus.emit(EVENTS.DEAL_UPDATED, { dealData });
  } catch (error) {
    console.error("Failed to sync deal update to backend:", error);
    showNotification("Deal updated locally. Will sync when connection is restored.", "warning");
    
    // Still emit updated event so UI updates
    eventBus.emit(EVENTS.DEAL_UPDATED, { dealData });
  }
}

export function handleDealCreated(event) {
  showNotification("Deal created successfully!", "success");

  eventBus.emit(EVENTS.WEB_SOCKET_SEND, { message: "Deal created." });

  const currentTab = window.location.pathname;
  
  // Append the new deal row to the table instead of refetching all data
  if (currentTab === "/deals" && event.detail && event.detail.dealData) {
    appendDealRow(event.detail.dealData);
  }
}

export function handleDealUpdated(event) {
  showNotification("Deal updated successfully!", "success");
  eventBus.emit(EVENTS.WEB_SOCKET_SEND, { message: "Deal updated." });

  const currentTab = window.location.pathname;

  // Update the deal row in the table instead of refetching all data
  if (currentTab === "/deals" && event.detail && event.detail.dealData) {
    const dealData = event.detail.dealData;
    updateRowById(
      "deals-body", 
      "data-deal-id", 
      dealData.deal_id, 
      dealData, 
      appendDealRow
    );
  }
}

export async function handleDealDelete(event) {
  const { dbWorker } = dbState;

  if (!dbWorker) return;

  const id = event.detail.id;
  
  // 1. First, delete from IndexedDB
  dbWorker.postMessage({
    action: "deleteDeal",
    id: id,
  });
  
  // 2. Then try to sync to backend
  try {
    await syncSingleEntityToBackend("deals", { deal_id: id }, "delete");
    eventBus.emit(EVENTS.DEAL_DELETED, { id });
  } catch (error) {
    console.error("Failed to sync deal deletion to backend:", error);
    showNotification("Deal deleted locally. Will sync when connection is restored.", "warning");
    
    // Still emit deleted event so UI updates
    eventBus.emit(EVENTS.DEAL_DELETED, { id });
  }
}

export function handleDealDeleted(event) {
  showNotification("Deal deleted successfully!", "success");
  eventBus.emit(EVENTS.WEB_SOCKET_SEND, { message: "Deal deleted." });

  const currentTab = window.location.pathname;

  // Remove the deal row from the table instead of refetching all data
  if (currentTab === "/deals" && event.detail && event.detail.id) {
    removeRowById("deals-body", "data-deal-id", event.detail.id);
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
