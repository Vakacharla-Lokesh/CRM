import { eventBus, EVENTS } from "./eventBus.js";
import { dbState } from "../services/state/dbState.js";
import { showMessage } from "./notificationEvents.js";

// LEAD EVENT FUNCTION HERE
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

// ORGANIZATION EVENT FUNCTIONS HERE
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

// DEAL EVENT FUNCTIONS HERE
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

// FORM SUBMISSION FUNCTIONS HERE
import {
  handleLeadFormSubmit,
  handleOrganizationFormSubmit,
  handleDealFormSubmit,
  handleUserFormSubmit,
} from "./handlers/formHandlers.js";

// USER EVENT FUNCTIONS HERE
import {
  handleUserCreate,
  handleUserCreated,
  handleUserDelete,
  handleUserDeleted,
  handleUserClick,
} from "./handlers/userHandlers.js";

// TENANT 
import {
  handleTenantCreate,
  handleTenantCreated,
  handleTenantUpdate,
  handleTenantUpdated,
  handleTenantDelete,
  handleTenantDeleted,
  handleTenantExport,
  handleTenantClick,
  handleBulkDeleteTenants,
  handleSelectAllTenants,
  handleTenantCheckboxChange,
} from "./handlers/tenantHandlers.js";


const eventHandlers = {
  database: {},
  lead: {},
  organization: {},
  deal: {},
  ui: {},
  auth: {},
  user: {},
  tenant: {}
};

const routeEventMap = {
  '/home': ['database', 'lead', 'organization', 'deal', 'ui', 'auth'],
  '/leads': ['database', 'lead', 'organization', 'ui', 'auth'],
  '/organizations': ['database', 'organization', 'ui', 'auth'],
  '/deals': ['database', 'deal', 'organization', 'lead', 'ui', 'auth'],
  '/users': ['database', 'user', 'ui', 'auth'],
  '/tenants': ['database', 'tenant', 'ui', 'auth'],
  '/login': ['auth'],
  '/signup': ['auth']
};

let currentActiveGroups = [];

export function initializeEventHandlers(worker) {
  dbState.initialize(worker);
  registerDatabaseEvents();
  registerUIEvents();
  registerAuthEvents();
  currentActiveGroups = ['database', 'ui', 'auth'];
  initializeClickHandlers();
  initializeFormHandlers();
  initializeDOMReady();
}

export function switchEventListeners(route) {
  const requiredGroups = routeEventMap[route] || ['database', 'ui', 'auth'];
  
  // Unregister event listeners
  currentActiveGroups.forEach(group => {
    if (!requiredGroups.includes(group) && group !== 'database' && group !== 'ui' && group !== 'auth') {
      unregisterEventGroup(group);
    }
  });
  
  // Register new event listeners
  requiredGroups.forEach(group => {
    if (!currentActiveGroups.includes(group)) {
      registerEventGroup(group);
    }
  });
  
  currentActiveGroups = [...requiredGroups];
  console.log(`[EventHandler] Active event groups for ${route}:`, currentActiveGroups);
}

function registerEventGroup(group) {
  switch(group) {
    case 'lead':
      registerLeadEvents();
      break;
    case 'organization':
      registerOrganizationEvents();
      break;
    case 'deal':
      registerDealEvents();
      break;
    case 'user':
      registerUserEvents();
      break;
    case 'tenant':
      registerTenantEvents();
      break;
  }
}

function unregisterEventGroup(group) {
  switch(group) {
    case 'lead':
      unregisterLeadEvents();
      break;
    case 'organization':
      unregisterOrganizationEvents();
      break;
    case 'deal':
      unregisterDealEvents();
      break;
    case 'user':
      unregisterUserEvents();
      break;
    case 'tenant':
      unregisterTenantEvents();
      break;
  }
}

function registerDatabaseEvents() {
  eventBus.on(EVENTS.DB_READY, handleDbReady);
  eventBus.on(EVENTS.DB_ERROR, handleDbError);
}

function registerLeadEvents() {
  eventHandlers.lead = {
    create: handleLeadCreate,
    created: handleLeadCreated,
    delete: handleLeadDelete,
    deleted: handleLeadDeleted,
    export: handleLeadExport,
    score: calculateLeadScore,
    refresh: handleLeadRefresh
  };
  
  eventBus.on(EVENTS.LEAD_CREATE, eventHandlers.lead.create);
  eventBus.on(EVENTS.LEAD_CREATED, eventHandlers.lead.created);
  eventBus.on(EVENTS.LEAD_DELETE, eventHandlers.lead.delete);
  eventBus.on(EVENTS.LEAD_DELETED, eventHandlers.lead.deleted);
  eventBus.on(EVENTS.LEADS_EXPORT, eventHandlers.lead.export);
  eventBus.on(EVENTS.LEADS_SCORE, eventHandlers.lead.score);
  eventBus.on(EVENTS.LEADS_REFRESH, eventHandlers.lead.refresh);
}

function unregisterLeadEvents() {
  if (!eventHandlers.lead.create) return;
  
  eventBus.off(EVENTS.LEAD_CREATE, eventHandlers.lead.create);
  eventBus.off(EVENTS.LEAD_CREATED, eventHandlers.lead.created);
  eventBus.off(EVENTS.LEAD_DELETE, eventHandlers.lead.delete);
  eventBus.off(EVENTS.LEAD_DELETED, eventHandlers.lead.deleted);
  eventBus.off(EVENTS.LEADS_EXPORT, eventHandlers.lead.export);
  eventBus.off(EVENTS.LEADS_SCORE, eventHandlers.lead.score);
  eventBus.off(EVENTS.LEADS_REFRESH, eventHandlers.lead.refresh);
  
  eventHandlers.lead = {};
}

function registerOrganizationEvents() {
  eventHandlers.organization = {
    create: handleOrganizationCreate,
    created: handleOrganizationCreated,
    delete: handleOrganizationDelete,
    deleted: handleOrganizationDeleted,
    update: handleOrganizationUpdate,
    updated: handleOrganizationUpdated,
    export: handleOrganizationExport
  };
  
  eventBus.on(EVENTS.ORGANIZATION_CREATE, eventHandlers.organization.create);
  eventBus.on(EVENTS.ORGANIZATION_CREATED, eventHandlers.organization.created);
  eventBus.on(EVENTS.ORGANIZATION_DELETE, eventHandlers.organization.delete);
  eventBus.on(EVENTS.ORGANIZATION_DELETED, eventHandlers.organization.deleted);
  eventBus.on(EVENTS.ORGANIZATION_UPDATE, eventHandlers.organization.update);
  eventBus.on(EVENTS.ORGANIZATION_UPDATED, eventHandlers.organization.updated);
  eventBus.on(EVENTS.ORGANIZATION_EXPORT, eventHandlers.organization.export);
}

function unregisterOrganizationEvents() {
  if (!eventHandlers.organization.create) return;
  
  eventBus.off(EVENTS.ORGANIZATION_CREATE, eventHandlers.organization.create);
  eventBus.off(EVENTS.ORGANIZATION_CREATED, eventHandlers.organization.created);
  eventBus.off(EVENTS.ORGANIZATION_DELETE, eventHandlers.organization.delete);
  eventBus.off(EVENTS.ORGANIZATION_DELETED, eventHandlers.organization.deleted);
  eventBus.off(EVENTS.ORGANIZATION_UPDATE, eventHandlers.organization.update);
  eventBus.off(EVENTS.ORGANIZATION_UPDATED, eventHandlers.organization.updated);
  eventBus.off(EVENTS.ORGANIZATION_EXPORT, eventHandlers.organization.export);
  
  eventHandlers.organization = {};
}

function registerDealEvents() {
  eventHandlers.deal = {
    create: handleDealCreate,
    created: handleDealCreated,
    delete: handleDealDelete,
    deleted: handleDealDeleted,
    update: handleDealUpdate,
    updated: handleDealUpdated,
    export: handleDealExport
  };
  
  eventBus.on(EVENTS.DEAL_CREATE, eventHandlers.deal.create);
  eventBus.on(EVENTS.DEAL_CREATED, eventHandlers.deal.created);
  eventBus.on(EVENTS.DEAL_DELETE, eventHandlers.deal.delete);
  eventBus.on(EVENTS.DEAL_DELETED, eventHandlers.deal.deleted);
  eventBus.on(EVENTS.DEAL_UPDATE, eventHandlers.deal.update);
  eventBus.on(EVENTS.DEAL_UPDATED, eventHandlers.deal.updated);
  eventBus.on(EVENTS.DEAL_EXPORT, eventHandlers.deal.export);
}

function unregisterDealEvents() {
  if (!eventHandlers.deal.create) return;
  
  eventBus.off(EVENTS.DEAL_CREATE, eventHandlers.deal.create);
  eventBus.off(EVENTS.DEAL_CREATED, eventHandlers.deal.created);
  eventBus.off(EVENTS.DEAL_DELETE, eventHandlers.deal.delete);
  eventBus.off(EVENTS.DEAL_DELETED, eventHandlers.deal.deleted);
  eventBus.off(EVENTS.DEAL_UPDATE, eventHandlers.deal.update);
  eventBus.off(EVENTS.DEAL_UPDATED, eventHandlers.deal.updated);
  eventBus.off(EVENTS.DEAL_EXPORT, eventHandlers.deal.export);
  
  eventHandlers.deal = {};
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
  eventHandlers.user = {
    create: handleUserCreate,
    created: handleUserCreated,
    delete: handleUserDelete,
    deleted: handleUserDeleted
  };
  
  eventBus.on(EVENTS.USER_CREATE, eventHandlers.user.create);
  eventBus.on(EVENTS.USER_CREATED, eventHandlers.user.created);
  eventBus.on(EVENTS.USER_DELETE, eventHandlers.user.delete);
  eventBus.on(EVENTS.USER_DELETED, eventHandlers.user.deleted);
}

function unregisterUserEvents() {
  if (!eventHandlers.user.create) return;
  
  eventBus.off(EVENTS.USER_CREATE, eventHandlers.user.create);
  eventBus.off(EVENTS.USER_CREATED, eventHandlers.user.created);
  eventBus.off(EVENTS.USER_DELETE, eventHandlers.user.delete);
  eventBus.off(EVENTS.USER_DELETED, eventHandlers.user.deleted);
  
  eventHandlers.user = {};
}

function registerTenantEvents() {
  eventHandlers.tenant = {
    create: handleTenantCreate,
    created: handleTenantCreated,
    update: handleTenantUpdate,
    updated: handleTenantUpdated,
    delete: handleTenantDelete,
    deleted: handleTenantDeleted,
    export: handleTenantExport
  };
  
  eventBus.on(EVENTS.TENANT_CREATE, eventHandlers.tenant.create);
  eventBus.on(EVENTS.TENANT_CREATED, eventHandlers.tenant.created);
  eventBus.on(EVENTS.TENANT_UPDATE, eventHandlers.tenant.update);
  eventBus.on(EVENTS.TENANT_UPDATED, eventHandlers.tenant.updated);
  eventBus.on(EVENTS.TENANT_DELETE, eventHandlers.tenant.delete);
  eventBus.on(EVENTS.TENANT_DELETED, eventHandlers.tenant.deleted);
  eventBus.on(EVENTS.TENANT_EXPORT, eventHandlers.tenant.export);
}

function unregisterTenantEvents() {
  if (!eventHandlers.tenant.create) return;
  
  eventBus.off(EVENTS.TENANT_CREATE, eventHandlers.tenant.create);
  eventBus.off(EVENTS.TENANT_CREATED, eventHandlers.tenant.created);
  eventBus.off(EVENTS.TENANT_UPDATE, eventHandlers.tenant.update);
  eventBus.off(EVENTS.TENANT_UPDATED, eventHandlers.tenant.updated);
  eventBus.off(EVENTS.TENANT_DELETE, eventHandlers.tenant.delete);
  eventBus.off(EVENTS.TENANT_DELETED, eventHandlers.tenant.deleted);
  eventBus.off(EVENTS.TENANT_EXPORT, eventHandlers.tenant.export);
  
  eventHandlers.tenant = {};
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
    }
  }, 500);
}

function handleLoginFailure(event) {
  console.log("Login failed:", event.detail);
}

function handleLogout() {
  console.log("User logged out");
  user.destroy();
}
