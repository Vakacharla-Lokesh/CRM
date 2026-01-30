import { eventBus, EVENTS } from "./eventBus.js";
import { dbState } from "../services/dbState.js";
import { showMessage } from "./notificationEvents.js";

import {
  handleLeadCreate,
  handleLeadCreated,
  handleLeadDelete,
  handleLeadDeleted,
  handleLeadExport,
  calculateLeadScore,
  handleLeadClick,
} from "./handlers/leadHandlers.js";

import {
  handleOrganizationCreate,
  handleOrganizationCreated,
  handleOrganizationDelete,
  handleOrganizationDeleted,
  handleOrganizationExport,
  handleOrganizationClick,
  handleOrganizationUpdate,
  handleOrganizationUpdated,
} from "./handlers/organizationHandlers.js";

import {
  handleDealCreate,
  handleDealCreated,
  handleDealDelete,
  handleDealDeleted,
  handleDealExport,
  handleDealClick,
  handleDealUpdate,
  handleDealUpdated,
} from "./handlers/dealHandlers.js";

import {
  handleLeadFormSubmit,
  handleOrganizationFormSubmit,
  handleDealFormSubmit,
  handleUserFormSubmit,
} from "./handlers/formHandlers.js";

import {
  handleUserCreate,
  handleUserCreated,
  handleUserDelete,
  handleUserDeleted,
  handleUserClick,
} from "./handlers/userHandlers.js";

export function initializeEventHandlers(worker) {
  // Initialize database state
  dbState.initialize(worker);

  // Subscribe to state changes (optional, for debugging)
  dbState.subscribe(({ dbWorker, isDbReady }) => {
    console.log(`[DB State] Worker: ${!!dbWorker}, Ready: ${isDbReady}`);
  });

  // Register all event listeners
  registerDatabaseEvents();
  registerLeadEvents();
  registerOrganizationEvents();
  registerDealEvents();
  registerUIEvents();
  registerAuthEvents();
  registerUserEvents();

  // Initialize theme and DOM listeners
  initializeTheme();
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
}

function registerOrganizationEvents() {
  eventBus.on(EVENTS.ORGANIZATION_CREATE, handleOrganizationCreate);
  eventBus.on(EVENTS.ORGANIZATION_CREATED, handleOrganizationCreated);
  eventBus.on(EVENTS.ORGANIZATION_DELETE, handleOrganizationDelete);
  eventBus.on(EVENTS.ORGANIZATION_DELETED, handleOrganizationDeleted);
  eventBus.on(EVENTS.ORGANIZATION_UPDATE, handleOrganizationUpdate);
  eventBus.on(EVENTS.ORGANIZATION_UPDATED, handleOrganizationUpdated);
  eventBus.on(EVENTS.ORGANIZATION_EXPORT, handleOrganizationExport);
}

function registerDealEvents() {
  eventBus.on(EVENTS.DEAL_CREATE, handleDealCreate);
  eventBus.on(EVENTS.DEAL_CREATED, handleDealCreated);
  eventBus.on(EVENTS.DEAL_DELETE, handleDealDelete);
  eventBus.on(EVENTS.DEAL_DELETED, handleDealDeleted);
  eventBus.on(EVENTS.DEAL_UPDATE, handleDealUpdate);
  eventBus.on(EVENTS.DEAL_UPDATED, handleDealUpdated);
  eventBus.on(EVENTS.DEAL_EXPORT, handleDealExport);
}

function registerUIEvents() {
  eventBus.on(EVENTS.MODAL_CLOSE, handleModalClose);
  eventBus.on(EVENTS.THEME_TOGGLE, handleThemeToggle);
  eventBus.on(EVENTS.WEB_SOCKET_MESSAGE, showMessage);
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

    // Close dropdowns when clicking outside
    if (
      !e.target.closest(".dropdown-menu") &&
      !e.target.closest(".dropdown-btn")
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

  const createDbBtn = document.getElementById("data-createDb");
  if (createDbBtn) {
    createDbBtn.textContent = "DB Ready";
    createDbBtn.classList.remove("bg-blue-100", "dark:bg-blue-900");
    createDbBtn.classList.add(
      "bg-green-100",
      "dark:bg-green-900",
      "text-green-600",
      "dark:text-green-300",
    );
    createDbBtn.disabled = true;
  }
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
    }
  }, 500);
}

function handleLoginFailure(event) {
  console.log("Login failed:", event.detail);
}

function handleLogout() {
  console.log("User logged out");
}

function initializeTheme() {
  const root = document.documentElement;
  const toggleBtn = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

  root.classList.toggle("dark", initialTheme === "dark");
  if (toggleBtn) {
    toggleBtn.textContent = initialTheme === "dark" ? "☀️" : "🌙";
  }
}
