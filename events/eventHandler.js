import { eventBus, EVENTS } from "./eventBus.js";
import { exportDb } from "../services/exportDb.js";
import {
  handleLeadCreate,
  handleLeadCreated,
  handleLeadDelete,
  handleLeadDeleted,
} from "./leadEvents.js";
// import {
//   handleOrganizationCreate,
//   handleOrganizationCreated,
//   handleOrganizationDelete,
//   handleOrganizationDeleted,
// } from "./organizationEvents.js";
import { handleDealCreate, handleDealCreated } from "./dealEvents.js";
import { showMessage, showNotification } from "./notificationEvents.js";
import { generateId } from "../services/uidGenerator.js";

let dbWorker = null;
let isDbReady = false;

export function initializeEventHandlers(worker) {
  dbWorker = worker;

  // DB EVENTS
  eventBus.on(EVENTS.DB_READY, handleDbReady);
  eventBus.on(EVENTS.DB_ERROR, handleDbError);
  // LEAD EVENTS
  eventBus.on(EVENTS.LEAD_CREATE, handleLeadCreate);
  eventBus.on(EVENTS.LEAD_CREATED, handleLeadCreated);
  eventBus.on(EVENTS.LEAD_DELETE, handleLeadDelete);
  eventBus.on(EVENTS.LEAD_DELETED, handleLeadDeleted);
  eventBus.on(EVENTS.LEADS_EXPORT, handleLeadExport);
  eventBus.on(EVENTS.LEADS_SCORE, calculateScore);

  // ORG EVENTS
  eventBus.on(EVENTS.ORGANIZATION_CREATE, handleOrganizationCreate);
  eventBus.on(EVENTS.ORGANIZATION_CREATED, handleOrganizationCreated);
  eventBus.on(EVENTS.ORGANIZATION_DELETE, handleOrganizationDelete);
  eventBus.on(EVENTS.ORGANIZATION_DELETED, handleOrganizationDeleted);
  eventBus.on(EVENTS.ORGANIZATION_EXPORT, handleOrganizationExport);

  // DEAL EVENTS
  eventBus.on(EVENTS.DEAL_CREATE, handleDealCreate);
  eventBus.on(EVENTS.DEAL_CREATED, handleDealCreated);
  eventBus.on(EVENTS.DEAL_DELETE, handleDealDelete);
  eventBus.on(EVENTS.DEAL_EXPORT, handleDealExport);

  // MODAL EVENTS
  eventBus.on(EVENTS.MODAL_CLOSE, handleModalClose);
  eventBus.on(EVENTS.THEME_TOGGLE, handleThemeToggle);

  // WEB SOCKET EVENTS
  eventBus.on(EVENTS.WEB_SOCKET_MESSAGE, showMessage);

  // LOGIN EVENTS
  eventBus.on(EVENTS.LOGIN_SUCCESS, handleLoginSuccess);
  eventBus.on(EVENTS.LOGIN_FAILURE, handleLoginFailure);
  eventBus.on(EVENTS.LOGOUT_SUCCESS, handleLogout);

  eventBus.on(EVENTS.USER_CREATED, handleUserCreated);

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      if (dbWorker) dbWorker.postMessage({ action: "initialize" });
    },
    { once: true },
  );

  document.addEventListener("click", (e) => {
    if (e.target.closest("#open-modal-btn")) {
      const modal = document.getElementById("form-modal");
      if (modal) {
        modal.classList.remove("hidden");
      }
      return;
    }

    if (e.target.closest("#close-modal-btn")) {
      const modal = document.getElementById("form-modal");
      if (modal) {
        modal.classList.add("hidden");
      }
      return;
    }

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
    }

    if (e.target.closest(".dropdown-btn")) {
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
      return;
    }

    if (e.target.closest("#editLead")) {
      e.preventDefault();
      e.stopImmediatePropagation();

      // console.log("Inside edit lead");

      const editBtn = e.target.closest("#editLead");
      const leadRow = editBtn.closest("tr");
      const lead_id = leadRow?.getAttribute("data-lead-id");

      sessionStorage.setItem("lead_id", lead_id);
      sessionStorage.setItem("currentTab", "/leadDetails");

      const dropdown = editBtn.closest(".dropdown-menu");
      if (dropdown) {
        dropdown.classList.add("hidden");
      }

      // console.log("Before loadroute");

      if (window.router && window.router.loadRoute) {
        // console.log("Inside if of route");
        window.router.loadRoute("/leadDetails");
      }

      // console.log("After loadroute");
      return;
    }

    if (e.target.closest("#deleteLead")) {
      e.preventDefault();
      e.stopImmediatePropagation();

      const deleteBtn = e.target.closest("#deleteLead");
      const leadRow = deleteBtn.closest("tr");
      const lead_id = leadRow?.getAttribute("data-lead-id");

      if (lead_id) {
        if (confirm("Are you sure you want to delete this lead?")) {
          eventBus.emit(EVENTS.LEAD_DELETE, { id: lead_id });
        }
      }

      const dropdown = deleteBtn.closest(".dropdown-menu");
      if (dropdown) {
        dropdown.classList.add("hidden");
      }
      return;
    }

    if (e.target.closest("#editOrganiztion")) {
      e.stopImmediatePropagation();

      const editBtn = e.target.closest("#editOrganization");
      const organizationRow = editBtn.closest("tr");
      const organization_id = organizationRow?.getAttribute(
        "data-organization-id",
      );

      sessionStorage.setItem("organization_id", organization_id);

      const dropdown = editBtn.closest(".dropdown-menu");
      if (dropdown) {
        dropdown.classList.add("hidden");
      }

      return;
    }

    if (e.target.closest("#deleteOrganization")) {
      e.stopImmediatePropagation();

      const deleteBtn = e.target.closest("#deleteOrganization");
      const organizationRow = deleteBtn.closest("tr");
      const organization_id = organizationRow?.getAttribute(
        "data-organization-id",
      );

      if (organization_id) {
        if (confirm("Are you sure you want to delete this organization?")) {
          eventBus.emit(EVENTS.ORGANIZATION_DELETE, {
            id: organization_id,
          });
        }
      }

      const dropdown = deleteBtn.closest(".dropdown-menu");
      if (dropdown) {
        dropdown.classList.add("hidden");
      }
      return;
    }

    if (e.target.closest("#deleteDeal")) {
      e.preventDefault();
      e.stopImmediatePropagation();

      const deleteBtn = e.target.closest("#deleteDeal");
      const dealRow = deleteBtn.closest("tr");
      const deal_id = dealRow?.getAttribute("data-deal-id");

      if (deal_id) {
        if (confirm("Are you sure you want to delete this lead?")) {
          eventBus.emit(EVENTS.DEAL_DELETE, { id: deal_id });
        }
      }

      const dropdown = deleteBtn.closest(".dropdown-menu");
      if (dropdown) {
        dropdown.classList.add("hidden");
      }
      return;
    }

    if (
      !e.target.closest(".dropdown-menu") &&
      !e.target.closest(".dropdown-btn")
    ) {
      document.querySelectorAll(".dropdown-menu").forEach((dropdown) => {
        dropdown.classList.add("hidden");
      });
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const modal = document.getElementById("form-modal");
      if (modal && !modal.classList.contains("hidden")) {
        modal.classList.add("hidden");
      }
    }
  });

  document.addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.target.matches("form[data-form='createLead']")) {
      event.preventDefault();
      if (!isDbReady && dbWorker) {
        dbWorker.postMessage({ action: "initialize" });
        showNotification("Database initializing, please try again...", "info");
        return;
      }

      const leadFormData = {
        lead_first_name:
          document.getElementById("first_name")?.value?.trim() || "",
        lead_last_name:
          document.getElementById("last_name")?.value?.trim() || "",
        lead_email: document.getElementById("email")?.value?.trim() || "",
        lead_mobile_number:
          document.getElementById("mobile_number")?.value?.trim() || "",
        organization_name:
          document.getElementById("organization_name")?.value?.trim() || "",
        organization_website_name:
          document.getElementById("organization_website_name")?.value?.trim() ||
          "",
        organization_size:
          document.getElementById("organization_size")?.value?.trim() || "",
        organization_industry:
          document.getElementById("organization_industry")?.value?.trim() || "",
      };

      const regex = /^[1-9]\d{9}$/;
      if (
        leadFormData.lead_mobile_number &&
        !regex.test(leadFormData.lead_mobile_number)
      ) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
      }

      if (!leadFormData.lead_first_name || !leadFormData.lead_email) {
        showNotification("Please fill in required fields", "error");
        return;
      }

      if (leadFormData.organization_name) {
        createOrganizationAndLead(leadFormData);
      } else {
        const leadData = {
          lead_id: generateId("lead"),
          lead_first_name: leadFormData.lead_first_name,
          lead_last_name: leadFormData.lead_last_name,
          lead_email: leadFormData.lead_email,
          lead_mobile_number: leadFormData.lead_mobile_number,
          organization_id: null,
          lead_source: "Manual",
          lead_score: 0,
          created_on: new Date(),
          modified_on: new Date(),
          lead_status: "New",
        };

        eventBus.emit(EVENTS.LEAD_CREATE, { leadData, dbWorker, isDbReady });
      }

      document.getElementById("form-modal")?.classList.add("hidden");
      event.target.reset();
    } else if (event.target.matches("form[data-form='createOrganization']")) {
      event.preventDefault();
      if (!isDbReady && dbWorker) {
        dbWorker.postMessage({ action: "initialize" });
        showNotification("Database initializing, please try again...", "info");
        return;
      }

      const organizationData = {
        organization_id: Date.now(),
        organization_name:
          document.getElementById("organization_name")?.value?.trim() || "",
        organization_website_name:
          document.getElementById("organization_website_name")?.value?.trim() ||
          "",
        organization_size:
          document.getElementById("organization_size")?.value?.trim() || "",
        organization_industry:
          document.getElementById("organization_industry")?.value?.trim() || "",
      };

      if (!organizationData.organization_name) {
        showNotification("Please enter organization name", "error");
        return;
      }

      eventBus.emit(EVENTS.ORGANIZATION_CREATE, { organizationData });
      document.getElementById("form-modal")?.classList.add("hidden");
      event.target.reset();
    } else if (event.target.matches("form[data-form='createDeal']")) {
      event.preventDefault();
      if (!isDbReady && dbWorker) {
        dbWorker.postMessage({ action: "initialize" });
        showNotification("Database initializing, please try again...", "info");
        return;
      }

      console.log("Inside handle Deal create caller");

      const dealName =
        document.getElementById("deal_name")?.value?.trim() || "";
      const dealValue =
        document.getElementById("deal_value")?.value?.trim() || "";
      const leadId = document.getElementById("lead_id")?.value || "";
      const organizationId =
        document.getElementById("organization_id")?.value || "";
      const dealStatus =
        document.getElementById("deal_status")?.value?.trim() || "";

      if (!dealName || !dealValue) {
        alert("Please fill in Deal Name and Deal Value");
        return;
      }

      if (!dealStatus) {
        alert("Please select a Deal Status");
        return;
      }

      const dealData = {
        deal_id: Date.now(),
        deal_name: dealName,
        deal_value: Number(dealValue),
        lead_id: leadId ? leadId : null,
        organization_id: organizationId ? organizationId : null,
        deal_status: dealStatus,
        created_on: new Date(),
        modified_on: new Date(),
      };

      if (leadId) {
        const lead = allLeads.find((l) => l.lead_id === dealData.lead_id);
        if (lead) {
          dealData.lead_first_name = lead.lead_first_name;
          dealData.lead_last_name = lead.lead_last_name;
        }
      }

      if (organizationId) {
        const org = allOrganizations.find(
          (o) => o.organization_id === dealData.organization_id,
        );
        if (org) {
          dealData.organization_name = org.organization_name;
        }
      }

      eventBus.emit(EVENTS.DEAL_CREATE, { dealData });
      document.getElementById("form-modal")?.classList.add("hidden");
      event.target.reset();
    }
  });
  initializeTheme();
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

function handleDbReady(event) {
  isDbReady = true;

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
  showNotification(`Database error: ${event.detail.error}`, "error");
}

function handleModalClose(event) {
  console.log("inside modal fn", event);
  // localStorage.setItem("");
}

function handleThemeToggle(event) {
  const { theme } = event.detail;
  const root = document.documentElement;

  root.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}

function handleLoginSuccess(event) {
  showNotification(`Welcome back, ${event.detail.name}!`, "success");

  // Import loadRoute and use it to navigate to home
  setTimeout(() => {
    if (window.router && window.router.loadRoute) {
      window.router.loadRoute("/home");
    } else {
      // Fallback if router not available
      window.router.loadRoute("/login");
    }
  }, 500);
}

function handleLoginFailure(event) {
  showNotification(event.detail.error || "Login failed", "error");
}

function handleUserCreated(event) {
  showNotification(
    "User created successfully! Redirecting to login...",
    "success",
  );
}

function calculateScore() {
  dbWorker.postMessage({ action: "calculateScore" });
}

function handleOrganizationCreate(event) {
  if (!isDbReady || !dbWorker) {
    showNotification("Database not ready yet. Please wait.", "error");
    return;
  }

  const organizationData = {
    organization_id: generateId("org"),
    ...event.detail.organizationData,
    created_on: new Date(),
    modified_on: new Date(),
  };

  dbWorker.postMessage({
    action: "createOrganization",
    organizationData,
  });
}

function handleOrganizationCreated(event) {
  showNotification("Organization created successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  if (currentTab === "/organizations" && dbWorker) {
    dbWorker.postMessage({ action: "getAllOrganizations" });
  }
}

function handleOrganizationDelete(event) {
  if (!dbWorker) return;

  const id = event.detail.id;
  dbWorker.postMessage({ action: "deleteOrganization", id });
}

function handleOrganizationDeleted(event) {
  showNotification("Organization deleted successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  if (currentTab === "/organizations" && dbWorker) {
    dbWorker.postMessage({ action: "getAllOrganizations" });
  }
}

function handleDealDelete(event) {
  if (!dbWorker) return;

  const id = event.detail.id;
  dbWorker.postMessage({ action: "deleteLead", id });
}

function handleLogout() {
  showNotification("User Logged Out Successfully");
}

function createOrganizationAndLead(formData) {
  const organizationId = generateId("org");

  const organizationData = {
    organization_id: organizationId,
    organization_name: formData.organization_name,
    organization_website_name: formData.organization_website_name || "",
    organization_size: formData.organization_size || "",
    organization_industry: formData.organization_industry || "",
    created_on: new Date(),
    modified_on: new Date(),
  };

  dbWorker.postMessage({
    action: "createOrganization",
    organizationData,
  });

  const organizationHandler = (e) => {
    const { action, storeName } = e.data;

    if (action === "insertSuccess" && storeName === "Organizations") {
      dbWorker.removeEventListener("message", organizationHandler);
      const leadData = {
        lead_id: generateId("lead"),
        lead_first_name: formData.lead_first_name,
        lead_last_name: formData.lead_last_name,
        lead_email: formData.lead_email,
        lead_mobile_number: formData.lead_mobile_number,
        organization_id: organizationId,
        organization_name: formData.organization_name,
        lead_source: "Manual",
        lead_score: 0,
        created_on: new Date(),
        modified_on: new Date(),
        lead_status: "New",
      };

      eventBus.emit(EVENTS.LEAD_CREATE, { leadData, dbWorker, isDbReady });
    }
  };

  dbWorker.addEventListener("message", organizationHandler);
}

export function handleLeadExport(event) {
  exportDb("Leads");
}

export function handleOrganizationExport(event) {
  exportDb("Organizations");
}

export function handleDealExport(event) {
  exportDb("Deals");
}
