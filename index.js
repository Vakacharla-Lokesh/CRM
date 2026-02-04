import { eventBus, EVENTS } from "./events/eventBus.js";
import { initializeEventHandlers } from "./events/eventHandler.js";
import router from "./router.js";
import { initializeOrgSelect } from "./components/organizationSelect.js";

import { longPolling } from "./services/communication/polling/longPolling.js";
import { checkHealth } from "./services/communication/polling/shortPolling.js";
import { initWebSocket } from "./services/communication/websockets/wsManager.js";
import {
  notificationManager,
  addNotification,
} from "./services/notificationManager.js";
import userManager from "./events/handlers/userManager.js";
import { setupFilterEventListeners } from "./js/filterIntegeration.js";

// Initialize DB Worker
window.dbWorker = new Worker("workers/dbWorker.js", { type: "module" });
const dbWorker = window.dbWorker;

// Initialize notification dropdown
notificationManager.initializeDropdown();

// DB Worker message handling
dbWorker.addEventListener("message", (e) => {
  const payload = e.data || {};

  if (payload.action === "dbReady") {
    console.log("Database ready, initializing router...");
    eventBus.emit(EVENTS.DB_READY, payload);
    addNotification("Database initialized successfully", "success");

    // Initialize router
    router.initialize(dbWorker);

    setTimeout(() => {
      setupFilterEventListeners();
      console.log("Filter event listeners setup complete");
    }, 100);

    initializeOrgSelect(dbWorker);
  }

  if (payload.action === "insertSuccess") {
    if (payload.storeName === "Leads") {
      eventBus.emit(EVENTS.LEAD_CREATED, payload);
      addNotification("Lead created successfully", "success");
    }
    if (payload.storeName === "Organizations") {
      eventBus.emit(EVENTS.ORGANIZATION_CREATED, payload);
      addNotification("Organization created successfully", "success");
    }
    if (payload.storeName === "Deals") {
      eventBus.emit(EVENTS.DEAL_CREATED, payload);
      addNotification("Deal created successfully", "success");
    }
    if (payload.storeName === "Users") {
      eventBus.emit(EVENTS.USER_CREATED, payload);
      addNotification("User created successfully", "success");
    }
  }

  if (payload.action === "updateSuccess") {
    if (payload.storeName === "Organizations") {
      eventBus.emit(EVENTS.ORGANIZATION_UPDATED, payload);
      addNotification("Organization updated successfully", "success");
    }
    if (payload.storeName === "Deals") {
      eventBus.emit(EVENTS.DEAL_UPDATED, payload);
      addNotification("Deal updated successfully", "success");
    }
  }

  if (payload.action === "deleteSuccess") {
    switch (payload.storeName) {
      case "Leads":
        eventBus.emit(EVENTS.LEAD_DELETED, payload);
        addNotification("Lead deleted successfully", "success");
        break;
      case "Organizations":
        eventBus.emit(EVENTS.ORGANIZATION_DELETED, payload);
        addNotification("Organization deleted successfully", "success");
        break;
      case "Deals":
        addNotification("Deal deleted successfully", "success");
        break;
    }
  }

  if (payload.action === "insertError" || payload.action === "dbError") {
    eventBus.emit(EVENTS.DB_ERROR, payload);
    addNotification(`Error: ${payload.error}`, "error");
  }

  if (e.data.action === "scoreUpdateSuccess") {
    const { updatedCount, totalLeads } = e.data;
    addNotification(
      `Lead scores updated! ${updatedCount} of ${totalLeads} leads modified.`,
      "success",
    );
  }

  if (e.data.action === "exportDataReady") {
    const { storeName, data } = e.data;
    import("./services/database/exportDb.js").then(
      ({ downloadCsvFromData }) => {
        downloadCsvFromData(storeName, data);
        addNotification(`${storeName} exported successfully`, "success");
      },
    );
  }

  if (e.data.action === "exportDataError") {
    addNotification(`Export failed: ${e.data.error}`, "error");
  }
});

// Initialize event handlers
initializeEventHandlers(dbWorker);

// User creation event
eventBus.on(EVENTS.USER_CREATED, (event) => {
  const userData = event.detail;
  addNotification(
    `New user created: ${userData.name} (${userData.email})`,
    "success",
  );

  if (window.ws) {
    window.ws.send({
      type: "user_created",
      data: userData,
      timestamp: new Date().toISOString(),
    });
  }
});

// Long polling call
longPolling();

// short polling call
checkHealth();

// Web sockets call
export function connectWebSocketIfAuthenticated() {
  if (!userManager.isAuthenticated()) return;

  let tenantId = userManager.getTenantId();

  if (!tenantId && userManager.isSuperAdmin()) {
    tenantId = "__GLOBAL__";
  }

  if (!tenantId) {
    console.warn("No tenant or global scope, skipping WebSocket");
    return;
  }

  window.wsClient = initWebSocket({
    url: `ws://localhost:3000?tenant_id=${tenantId}`,
  });
}

connectWebSocketIfAuthenticated();
