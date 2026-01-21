import { eventBus, EVENTS } from "./eventBus.js";
import { exportDb } from "../services/exportDb.js";

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
      exportDb();
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

function handleLeadCreate(event) {
  if (!isDbReady || !dbWorker) {
    showNotification("Database not ready yet. Please wait.", "error");
    return;
  }

  const leadData = {
    lead_id: Date.now(),
    ...event.detail.leadData,
    created_on: new Date(),
    modified_on: new Date(),
  };

  dbWorker.postMessage({
    action: "createLead",
    leadData,
  });
}

function handleLeadCreated(event) {
  showNotification("Lead created successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  if (currentTab === "/leads" && dbWorker) {
    dbWorker.postMessage({ action: "getAllLeads" });
  }
}

function handleLeadDelete(event) {
  if (!dbWorker) return;

  const id = Number(event.detail.id);
  dbWorker.postMessage({ action: "deleteLead", id });
}

function handleLeadDeleted(event) {
  showNotification("Lead deleted successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  if (currentTab === "/leads" && dbWorker) {
    dbWorker.postMessage({ action: "getAllLeads" });
  }
}

function handleOrganizationDelete(event) {
  if (!dbWorker) return;

  const id = Number(event.detail.id);
  dbWorker.postMessage({ action: "deleteOrganization", id });
}

function handleOrganizationDeleted(event) {
  showNotification("Organization deleted successfully!", "success");

  const currentTab = sessionStorage.getItem("currentTab");
  if (currentTab === "/organizations" && dbWorker) {
    dbWorker.postMessage({ action: "getAllOrganizations" });
  }
}

function handleOrganizationCreate(event) {
  if (!isDbReady || !dbWorker) {
    showNotification("Database not ready yet. Please wait.", "error");
    return;
  }

  const organizationData = {
    organization_id: Date.now(),
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

function handleOrganizationExport(event) {
  exportDb();
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

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `fixed top-20 right-4 px-4 py-3 rounded-lg shadow-lg transition-all transform translate-x-0 z-50 ${
    type === "success"
      ? "bg-green-500 text-white"
      : type === "error"
        ? "bg-red-500 text-white"
        : "bg-blue-500 text-white"
  }`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = "translateX(400px)";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function showMessage(event) {
  const payload = event?.detail || event;
  const message = payload?.message ?? payload;

  const messages = document.getElementById("messages");
  if (!messages) return;

  const msgElement = document.createElement("div");
  msgElement.className = "text-gray-700 dark:text-gray-300 mb-1";
  msgElement.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;

  messages.appendChild(msgElement);
  messages.scrollTop = messages.scrollHeight;

  while (messages.children.length > 10) {
    messages.removeChild(messages.firstChild);
  }
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
