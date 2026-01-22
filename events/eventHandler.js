import { eventBus, EVENTS } from "./eventBus.js";
import { exportDb } from "../services/exportDb.js";
import {
  handleLeadCreate,
  handleLeadCreated,
  handleLeadDelete,
  handleLeadDeleted,
} from "./leadEvents.js";
import {
  handleOrganizationCreate,
  handleOrganizationCreated,
  handleOrganizationDelete,
  handleOrganizationDeleted,
} from "./organizationEvents.js";
import { handleDealCreate, handleDealCreated } from "./dealEvents.js";
import { showMessage, showNotification } from "./notificationEvents.js";

let dbWorker = null;
let isDbReady = false;

export function initializeEventHandlers(worker) {
  dbWorker = worker;

  // Event bus listeners
  eventBus.on(EVENTS.DB_READY, handleDbReady);
  eventBus.on(EVENTS.DB_ERROR, handleDbError);
  eventBus.on(EVENTS.LEAD_CREATE, handleLeadCreate);
  eventBus.on(EVENTS.LEAD_CREATED, handleLeadCreated);
  eventBus.on(EVENTS.LEAD_DELETE, handleLeadDelete);
  eventBus.on(EVENTS.LEAD_DELETED, handleLeadDeleted);
  eventBus.on(EVENTS.LEADS_EXPORT, handleLeadExport);
  eventBus.on(EVENTS.ORGANIZATION_CREATE, handleOrganizationCreate);
  eventBus.on(EVENTS.ORGANIZATION_CREATED, handleOrganizationCreated);
  eventBus.on(EVENTS.ORGANIZATION_DELETE, handleOrganizationDelete);
  eventBus.on(EVENTS.ORGANIZATION_DELETED, handleOrganizationDeleted);
  eventBus.on(EVENTS.ORGANIZATION_EXPORT, handleOrganizationExport);
  eventBus.on(EVENTS.MODAL_CLOSE, handleModalClose);
  eventBus.on(EVENTS.THEME_TOGGLE, handleThemeToggle);
  eventBus.on(EVENTS.WEB_SOCKET_MESSAGE, showMessage);
  eventBus.on(EVENTS.LOGIN_SUCCESS, handleLoginSuccess);
  eventBus.on(EVENTS.LOGIN_FAILURE, handleLoginFailure);
  eventBus.on(EVENTS.USER_CREATED, handleUserCreated);
  eventBus.on(EVENTS.LEADS_SCORE, calculateScore);
  eventBus.on(EVENTS.DEAL_CREATE, handleDealCreate);
  eventBus.on(EVENTS.DEAL_CREATED, handleDealCreated);

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

    if (e.target.closest("#export-leads")) {
      eventBus.emit(EVENTS.LEADS_EXPORT);
      return;
    }

    if (e.target.closest("#export-organizations")) {
      eventBus.emit(EVENTS.ORGANIZATION_EXPORT);
      return;
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
      e.stopImmediatePropagation();

      const editBtn = e.target.closest("#editLead");
      const leadRow = editBtn.closest("tr");
      const lead_id = leadRow?.getAttribute("data-lead-id");

      sessionStorage.setItem("lead_id", lead_id);

      const dropdown = editBtn.closest(".dropdown-menu");
      if (dropdown) {
        dropdown.classList.add("hidden");
      }

      // Navigate to lead details page
      if (window.router && window.router.loadRoute) {
        window.router.loadRoute("/leadsDetails");
      }
      return;
    }

    if (e.target.closest("#deleteLead")) {
      e.stopImmediatePropagation();

      const deleteBtn = e.target.closest("#deleteLead");
      const leadRow = deleteBtn.closest("tr");
      const lead_id = leadRow?.getAttribute("data-lead-id");

      if (lead_id) {
        if (confirm("Are you sure you want to delete this lead?")) {
          eventBus.emit(EVENTS.LEAD_DELETE, { id: Number(lead_id) });
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
            id: Number(organization_id),
          });
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

      const leadData = {
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

      if (!leadData.lead_first_name || !leadData.lead_email) {
        showNotification("Please fill in required fields", "error");
        return;
      }

      eventBus.emit(EVENTS.LEAD_CREATE, { leadData });
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
        lead_id: leadId ? Number(leadId) : null,
        organization_id: organizationId ? Number(organizationId) : null,
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
      window.location.href = "/#/home";
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

function handleLeadExport(event) {
  exportDb("Leads");
}

function handleOrganizationExport(event) {
  exportDb("Organizations");
}
