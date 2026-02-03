import { dbState } from "../../services/state/dbState.js";
import { showNotification } from "../notificationEvents.js";

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

export function handleDealUpdate(event) {
  const { dbWorker, isDbReady } = dbState;

  if (!isDbReady || !dbWorker) {
    showNotification("Database not ready yet. Please wait.", "error");
    return;
  }

  const dealData = {
    ...event.detail.dealData,
    modified_on: new Date(),
  };

  dbWorker.postMessage({
    action: "updateDeal",
    dealData,
    storeName: "Deals",
  });
}

export function handleDealCreated(event) {
  showNotification("Deal created successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  const { dbWorker } = dbState;

  if (currentTab === "/deals" && dbWorker) {
    const user = JSON.parse(localStorage.getItem("user"));
    dbWorker.postMessage({
      action: "getAllDeals",
      user_id: user.user_id,
      tenant_id: user.tenant_id,
      role: user.role,
    });
  }
}

export function handleDealUpdated(event) {
  showNotification("Deal updated successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  const { dbWorker } = dbState;

  if (currentTab === "/deals" && dbWorker) {
    const user = JSON.parse(localStorage.getItem("user"));
    dbWorker.postMessage({
      action: "getAllDeals",
      user_id: user.user_id,
      tenant_id: user.tenant_id,
      role: user.role,
    });
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
    const user = JSON.parse(localStorage.getItem("user"));
    dbWorker.postMessage({
      action: "getAllDeals",
      user_id: user.user_id,
      tenant_id: user.tenant_id,
      role: user.role,
    });
  }
}

export function handleDealExport() {
  const { dbWorker } = dbState;
  if (dbWorker) {
    dbWorker.postMessage({ action: "exportData", storeName: "Deals" });
  }
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
