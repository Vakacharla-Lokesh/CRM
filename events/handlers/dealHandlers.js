import { dbState } from "../../services/dbState.js";
import { showNotification } from "../notificationEvents.js";
import { exportDb } from "../../services/exportDb.js";

export function handleDealCreate(event) {
  const { dbWorker, isDbReady } = dbState;

  if (!isDbReady || !dbWorker) {
    showNotification("Database not ready yet. Please wait.", "error");
    return;
  }

  const dealData = {
    ...event.detail.dealData,
  };

  dbWorker.postMessage({
    action: "createDeal",
    dealData,
    storeName: "Deals",
  });
}

export function handleDealCreated(event) {
  showNotification("Deal created successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  const { dbWorker } = dbState;

  if (currentTab === "/deals" && dbWorker) {
    dbWorker.postMessage({ action: "getAllDeals" });
  }
}

export function handleDealDelete(event) {
  const { dbWorker } = dbState;

  if (!dbWorker) return;

  const id = event.detail.id;
  dbWorker.postMessage({ action: "deleteDeal", id });
}

export function handleDealDeleted(event) {
  showNotification("Deal deleted successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  const { dbWorker } = dbState;

  if (currentTab === "/deals" && dbWorker) {
    dbWorker.postMessage({ action: "getAllDeals" });
  }
}

export function handleDealExport() {
  exportDb("Deals");
}

// Click handler for deal actions
export function handleDealClick(e) {
  if (e.target.closest("#editDeal")) {
    e.stopImmediatePropagation();
    const editBtn = e.target.closest("#editDeal");
    const dealRow = editBtn.closest("tr");
    const deal_id = dealRow?.getAttribute("data-deal-id");

    if (deal_id) {
      sessionStorage.setItem("deal_id", deal_id);

      const dropdown = editBtn.closest(".dropdown-menu");
      if (dropdown) {
        dropdown.classList.add("hidden");
      }

      if (window.router && window.router.loadRoute) {
        window.router.loadRoute("/dealDetails");
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
