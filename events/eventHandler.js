import { eventBus, EVENTS } from "./eventBus.js";
import { dbState } from "../services/state/dbState.js";
import { showMessage } from "./notificationEvents.js";

// LEAD EVENTS FUNCTIONS
import {
  handleLeadCreate,
  handleLeadCreated,
  handleLeadDelete,
  handleLeadDeleted,
  handleLeadExport,
  calculateLeadScore,
  handleLeadClick,
  handleLeadRefresh,
} from "./handlers/leadHandlers.js";

// ORGANIZATION EVENTS FUNCTIONS
import {
  handleOrganizationCreate,
  handleOrganizationCreated,
  handleOrganizationDelete,
  handleOrganizationDeleted,
  handleOrganizationExport,
  handleOrganizationClick,
  handleOrganizationUpdate,
  handleOrganizationUpdated,
  handleOrganizationRefresh,
} from "./handlers/organizationHandlers.js";

// DEAL EVENTS FUNCTIONS
import {
  handleDealCreate,
  handleDealCreated,
  handleDealDelete,
  handleDealDeleted,
  handleDealExport,
  handleDealClick,
  handleDealUpdate,
  handleDealUpdated,
  handleDealRefresh,
} from "./handlers/dealHandlers.js";

// FORM SUBMIT EVENT FUNCTIONS
import {
  handleLeadFormSubmit,
  handleOrganizationFormSubmit,
  handleDealFormSubmit,
  handleUserFormSubmit,
} from "./handlers/formHandlers.js";

// USER EVENT FUNCTIONS
import {
  handleUserCreate,
  handleUserCreated,
  handleUserDelete,
  handleUserDeleted,
  handleUserClick,
} from "./handlers/userHandlers.js";

// TENANT EVENT FUNCTIONS
import {
  handleTenantCreate,
  handleTenantCreated,
  handleTenantUpdate,
  handleTenantUpdated,
  handleTenantDelete,
  handleTenantDeleted,
  handleTenantClick,
  handleBulkDeleteTenants,
  handleSelectAllTenants,
  handleTenantCheckboxChange,
} from "./handlers/tenantHandlers.js";

export function initializeEventHandlers(worker) {
  dbState.initialize(worker);

  // All event listeners
  registerDatabaseEvents();
  registerLeadEvents();
  registerOrganizationEvents();
  registerDealEvents();
  registerUIEvents();
  registerAuthEvents();
  registerUserEvents();
  registerTenantEvents();
  initializeClickHandlers();
  initializeFormHandlers();
  initializeDOMReady();
}

export function initializeEventHandlersByRoute(worker) {
  dbState.initialize(worker);
  registerDatabaseEvents();
  registerLeadEvents();
  registerOrganizationEvents();
  registerDealEvents();
  registerUIEvents();
  registerAuthEvents();
  registerUserEvents();
  registerTenantEvents();
  initializeClickHandlers();
  initializeFormHandlers();
  initializeDOMReady();
}

function registerDatabaseEvents() {
  eventBus.on(EVENTS.DB_READY, handleDbReady);
  eventBus.on(EVENTS.DB_ERROR, handleDbError);
}

function registerLeadEvents() {
  eventBus.on(EVENTS.LEAD_CREATE, handleLeadCreate);
  eventBus.on(EVENTS.LEAD_CREATED, handleLeadCreated);
  eventBus.on(EVENTS.LEAD_DELETE, handleLeadDelete);
  eventBus.on(EVENTS.LEAD_DELETED, handleLeadDeleted);
  eventBus.on(EVENTS.LEADS_EXPORT, handleLeadExport);
  eventBus.on(EVENTS.LEADS_SCORE, calculateLeadScore);
  eventBus.on(EVENTS.LEADS_REFRESH, handleLeadRefresh);
}

function unregisterLeadEvents() {
  eventBus.off(EVENTS.LEAD_CREATE, handleLeadCreate);
  eventBus.off(EVENTS.LEAD_CREATED, handleLeadCreated);
  eventBus.off(EVENTS.LEAD_DELETE, handleLeadDelete);
  eventBus.off(EVENTS.LEAD_DELETED, handleLeadDeleted);
  eventBus.off(EVENTS.LEADS_EXPORT, handleLeadExport);
  eventBus.off(EVENTS.LEADS_SCORE, calculateLeadScore);
  eventBus.off(EVENTS.LEADS_REFRESH, handleLeadRefresh);
}

function registerOrganizationEvents() {
  eventBus.on(EVENTS.ORGANIZATION_CREATE, handleOrganizationCreate);
  eventBus.on(EVENTS.ORGANIZATION_CREATED, handleOrganizationCreated);
  eventBus.on(EVENTS.ORGANIZATION_DELETE, handleOrganizationDelete);
  eventBus.on(EVENTS.ORGANIZATION_DELETED, handleOrganizationDeleted);
  eventBus.on(EVENTS.ORGANIZATION_UPDATE, handleOrganizationUpdate);
  eventBus.on(EVENTS.ORGANIZATION_UPDATED, handleOrganizationUpdated);
  eventBus.on(EVENTS.ORGANIZATION_EXPORT, handleOrganizationExport);
  eventBus.on(EVENTS.ORGANIZATION_REFRESH, handleOrganizationRefresh);
}

function unregisterOrganizationEvents() {
  eventBus.off(EVENTS.ORGANIZATION_CREATE, handleOrganizationCreate);
  eventBus.off(EVENTS.ORGANIZATION_CREATED, handleOrganizationCreated);
  eventBus.off(EVENTS.ORGANIZATION_DELETE, handleOrganizationDelete);
  eventBus.off(EVENTS.ORGANIZATION_DELETED, handleOrganizationDeleted);
  eventBus.off(EVENTS.ORGANIZATION_UPDATE, handleOrganizationUpdate);
  eventBus.off(EVENTS.ORGANIZATION_UPDATED, handleOrganizationUpdated);
  eventBus.off(EVENTS.ORGANIZATION_EXPORT, handleOrganizationExport);
  eventBus.off(EVENTS.ORGANIZATION_REFRESH, handleOrganizationRefresh);
}

function registerDealEvents() {
  eventBus.on(EVENTS.DEAL_CREATE, handleDealCreate);
  eventBus.on(EVENTS.DEAL_CREATED, handleDealCreated);
  eventBus.on(EVENTS.DEAL_DELETE, handleDealDelete);
  eventBus.on(EVENTS.DEAL_DELETED, handleDealDeleted);
  eventBus.on(EVENTS.DEAL_UPDATE, handleDealUpdate);
  eventBus.on(EVENTS.DEAL_UPDATED, handleDealUpdated);
  eventBus.on(EVENTS.DEAL_EXPORT, handleDealExport);
  eventBus.on(EVENTS.DEAL_REFRESH, handleDealRefresh);
}

function unregisterDealEvents() {
  eventBus.off(EVENTS.DEAL_CREATE, handleDealCreate);
  eventBus.off(EVENTS.DEAL_CREATED, handleDealCreated);
  eventBus.off(EVENTS.DEAL_DELETE, handleDealDelete);
  eventBus.off(EVENTS.DEAL_DELETED, handleDealDeleted);
  eventBus.off(EVENTS.DEAL_UPDATE, handleDealUpdate);
  eventBus.off(EVENTS.DEAL_UPDATED, handleDealUpdated);
  eventBus.off(EVENTS.DEAL_EXPORT, handleDealExport);
  eventBus.off(EVENTS.DEAL_REFRESH, handleDealRefresh);
}

function registerUIEvents() {
  eventBus.on(EVENTS.MODAL_CLOSE, handleModalClose);
  eventBus.on(EVENTS.THEME_TOGGLE, handleThemeToggle);
  eventBus.on(EVENTS.WEB_SOCKET_MESSAGE, showMessage);
  eventBus.on(EVENTS.WEB_SOCKET_SEND, handleWebSocketSend);
}

function registerAuthEvents() {
  eventBus.on(EVENTS.LOGIN_SUCCESS, handleLoginSuccess);
  eventBus.on(EVENTS.LOGIN_FAILURE, handleLoginFailure);
  eventBus.on(EVENTS.LOGOUT_SUCCESS, handleLogout);
  eventBus.on(EVENTS.USER_CREATED, handleUserCreated);
}

function registerUserEvents() {
  eventBus.on(EVENTS.USER_CREATE, handleUserCreate);
  eventBus.on(EVENTS.USER_CREATED, handleUserCreated);
  eventBus.on(EVENTS.USER_DELETE, handleUserDelete);
  eventBus.on(EVENTS.USER_DELETED, handleUserDeleted);
}

function registerTenantEvents() {
  eventBus.on(EVENTS.TENANT_CREATE, handleTenantCreate);
  eventBus.on(EVENTS.TENANT_CREATED, handleTenantCreated);
  eventBus.on(EVENTS.TENANT_UPDATE, handleTenantUpdate);
  eventBus.on(EVENTS.TENANT_UPDATED, handleTenantUpdated);
  eventBus.on(EVENTS.TENANT_DELETE, handleTenantDelete);
  eventBus.on(EVENTS.TENANT_DELETED, handleTenantDeleted);
}

function unregisterTenantEvents() {
  eventBus.off(EVENTS.TENANT_CREATE, handleTenantCreate);
  eventBus.off(EVENTS.TENANT_CREATED, handleTenantCreated);
  eventBus.off(EVENTS.TENANT_UPDATE, handleTenantUpdate);
  eventBus.off(EVENTS.TENANT_UPDATED, handleTenantUpdated);
  eventBus.off(EVENTS.TENANT_DELETE, handleTenantDelete);
  eventBus.off(EVENTS.TENANT_DELETED, handleTenantDeleted);
}

function initializeClickHandlers() {
  document.addEventListener("click", (e) => {
    // Modal handlers
    if (e.target.closest("#open-modal-btn")) {
      document.getElementById("form-modal")?.classList.remove("hidden");
      return;
    }

    if (e.target.closest("#close-modal-btn")) {
      console.log("Inside close modal btn: ");
      document.getElementById("form-modal")?.classList.add("hidden");
      sessionStorage.removeItem("lead_id");
      sessionStorage.removeItem("organization_id");
      sessionStorage.removeItem("deal_id");
      return;
    }

    // Export buttons
    if (e.target.closest("#calculate-score")) {
      eventBus.emit(EVENTS.LEADS_SCORE);
      return;
    }

    if (e.target.closest("#export-leads")) {
      eventBus.emit(EVENTS.LEADS_EXPORT);
      return;
    }

    if (e.target.closest("#export-organizations")) {
      eventBus.emit(EVENTS.ORGANIZATION_EXPORT);
      return;
    }

    if (e.target.closest("#export-deals")) {
      eventBus.emit(EVENTS.DEAL_EXPORT);
      return;
    }

    if (e.target.closest("#export-tenants")) {
      eventBus.emit(EVENTS.TENANT_EXPORT);
      return;
    }

    // Tenant modal handler
    if (e.target.closest("#open-tenant-modal-btn")) {
      const modal = document.querySelector("tenant-modal");
      if (modal) modal.open();
      return;
    }

    // Bulk delete buttons
    if (e.target.closest("#bulk-delete-tenants")) {
      handleBulkDeleteTenants();
      return;
    }

    // Select all checkboxes
    if (e.target.id === "select-all-tenants") {
      handleSelectAllTenants(e);
      return;
    }

    // Individual checkbox change
    if (
      e.target.classList.contains("item-checkbox") &&
      e.target.closest("#tenants-table")
    ) {
      handleTenantCheckboxChange();
      return;
    }

    // Dropdown handling
    if (e.target.closest(".dropdown-btn")) {
      handleDropdownClick(e);
      return;
    }

    // Delegate to specific handlers
    if (handleLeadClick(e)) return;
    if (handleOrganizationClick(e)) return;
    if (handleDealClick(e)) return;
    if (handleUserClick(e)) return;
    if (handleTenantClick(e)) return;
    if (e.target.closest(".dropdown-btn")) {
      handleDropdownClick(e);
      return;
    }

    // Delegate to specific handlers
    if (handleLeadClick(e)) return;
    if (handleOrganizationClick(e)) return;
    if (handleDealClick(e)) return;
    if (handleUserClick(e)) return;

    // Close dropdowns when clicking outside
    if (event.target.matches("form[data-form='createTenant']")) {
      return;
    } else if (
      !e.target.closest(".dropdown-menu") &&
      !e.target.closest(".dropdown-btn") &&
      !e.target.closest("[data-org-id]") &&
      !e.target.closest("[data-lead-id]")
    ) {
      document.querySelectorAll(".dropdown-menu").forEach((dropdown) => {
        dropdown.classList.add("hidden");
      });
    }
  });

  // Escape key handler
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const modal = document.getElementById("form-modal");
      if (modal && !modal.classList.contains("hidden")) {
        modal.classList.add("hidden");
      }
    }
  });
}

function initializeFormHandlers() {
  document.addEventListener("submit", (event) => {
    if (event.target.matches("form[data-form='createLead']")) {
      handleLeadFormSubmit(event);
    } else if (event.target.matches("form[data-form='createOrganization']")) {
      handleOrganizationFormSubmit(event);
    } else if (event.target.matches("form[data-form='createDeal']")) {
      handleDealFormSubmit(event);
    } else if (event.target.matches("form[data-form='createUser']")) {
      handleUserFormSubmit(event);
    }
  });
}

function initializeDOMReady() {
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      const { dbWorker } = dbState;
      if (dbWorker) {
        dbWorker.postMessage({ action: "initialize" });
      }
    },
    { once: true },
  );
}

// Helper functions
function handleDropdownClick(e) {
  e.stopPropagation();
  const button = e.target.closest(".dropdown-btn");
  const menu = button.nextElementSibling;

  document.querySelectorAll(".dropdown-menu").forEach((dropdown) => {
    if (dropdown !== menu) {
      dropdown.classList.add("hidden");
    }
  });

  if (menu && menu.classList.contains("dropdown-menu")) {
    menu.classList.toggle("hidden");
  }
}

function handleDbReady(event) {
  dbState.isDbReady = true;
}

function handleDbError(event) {
  console.error("[EventHandlers] Database error:", event.detail);
}

function handleModalClose(event) {
  // Handle modal close logic
}

function handleThemeToggle(event) {
  const { theme } = event.detail;
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}

function handleLoginSuccess(event) {
  setTimeout(() => {
    if (window.router && window.router.loadRoute) {
      window.router.loadRoute("/home");
      connectWebSocketIfAuthenticated();
      addNotification(`Welcome back.`, "success");
    }
  }, 500);
}

function handleLoginFailure(event) {
  console.log("Login failed:", event.detail);
}

function handleLogout() {
  console.log("User logged out");
}

function handleWebSocketSend(event) {
  const { message } = event.detail;
  if (!message) {
    console.error("[EventHandlers] No message provided for websocket send");
    return;
  }

  if (window.wsClient) {
    window.wsClient.send(message);
    console.log("[EventHandlers] Message sent to websocket:", message);
  } else {
    console.error("[EventHandlers] WebSocket client not initialized");
  }
}
