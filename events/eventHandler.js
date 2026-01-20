import { eventBus, EVENTS } from "./eventBus.js";
import { exportDb } from "../services/exportDb.js";

let dbWorker = null;
let isDbReady = false;

export function initializeEventHandlers(worker) {
  dbWorker = worker;

  eventBus.on(EVENTS.DB_READY, handleDbReady);
  eventBus.on(EVENTS.DB_ERROR, handleDbError);

  eventBus.on(EVENTS.LEAD_CREATE, handleLeadCreate);
  eventBus.on(EVENTS.LEAD_CREATED, handleLeadCreated);
  eventBus.on(EVENTS.LEAD_DELETE, handleLeadDelete);

  eventBus.on(EVENTS.MODAL_CLOSE, handleModalClose);
  eventBus.on(EVENTS.THEME_TOGGLE, handleThemeToggle);

  eventBus.on(EVENTS.WEB_SOCKET_MESSAGE, showMessage);

  // DOM interaction handlers
  document.addEventListener("DOMContentLoaded", () => {
    // ensure DB is initialized
    if (dbWorker) dbWorker.postMessage({ action: "initialize" });
  }, { once: true });

  document.addEventListener("click", (e) => {
    const modal = document.getElementById("form-modal");
    if (e.target.closest("#open-modal-btn")) {
      modal?.classList.remove("hidden");
    }

    if (e.target.closest("#close-modal-btn")) {
      modal?.classList.add("hidden");
    }

    if (e.target.closest("#export-leads")) {
      exportDb();
    }

    if (e.target.closest(".dropdown-btn")) {
      const button = e.target.closest(".dropdown-btn");
      const allMenus = document.querySelectorAll(".dropdown-menu");
      allMenus.forEach((menu) => {
        if (!menu.previousElementSibling?.contains(e.target)) {
          menu.classList.add("hidden");
        }
      });
      if (button) {
        const menu = button.nextElementSibling;
        menu.classList.toggle("hidden");
      }
    }

    if (e.target.closest("#deleteLead")) {
      const leadRow = e.target.closest("tr");
      const lead_id = leadRow?.getAttribute("data-lead-id");
      if (lead_id) {
        eventBus.emit(EVENTS.LEAD_DELETE, { id: lead_id });
      }
    }
  });

  document.addEventListener("keydown", (e) => {
    const modal = document.getElementById("form-modal");
    if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) {
      modal.classList.add("hidden");
    }
  });

  document.addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.target.matches("form[data-form='createLead']")) {
      if (!isDbReady) {
        if (dbWorker) dbWorker.postMessage({ action: "initialize" });
      }

      const leadData = {
        lead_first_name: document.getElementById("first_name")?.value || "",
        lead_last_name: document.getElementById("last_name")?.value || "",
        lead_email: document.getElementById("email")?.value || "",
        lead_mobile_number: document.getElementById("mobile_number")?.value || "",
        organization_name: document.getElementById("organization_name")?.value || "",
        organization_website_name: document.getElementById("organization_website_name")?.value || "",
        organizationSize: document.getElementById("organization_size")?.value || "",
        organization_industry: document.getElementById("organization_industry")?.value || "",
      };

      eventBus.emit(EVENTS.LEAD_CREATE, { leadData });
      document.getElementById("form-modal")?.classList.add("hidden");
      event.target.reset();

    } else if (event.target.matches("form[data-form='createOrganization']")) {
      if (!isDbReady) {
        if (dbWorker) dbWorker.postMessage({ action: "initialize" });
      }

      const organizationData = {
        organization_id: Date.now(),
        organization_name: document.getElementById("organization_name")?.value || "",
        organization_website_name: document.getElementById("organization_website_name")?.value || "",
        organization_size: document.getElementById("organization_size")?.value || "",
        organization_industry: document.getElementById("organization_industry")?.value || "",
      };

      if (dbWorker) {
        dbWorker.postMessage({ action: "createOrganization", organizationData });
      }

      document.getElementById("form-modal")?.classList.add("hidden");
      event.target.reset();
    }
  });

  // Apply initial theme
  const root = document.documentElement;
  const toggleBtn = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
  root.classList.toggle("dark", initialTheme === "dark");
  if (toggleBtn) toggleBtn.textContent = initialTheme === "dark" ? "☀️" : "🌙";
}

function handleDbReady(event) {
  // console.log("[EventHandlers] Database ready");
  isDbReady = true;

  const createDbBtn = document.getElementById("data-createDb");
  if (createDbBtn) {
    createDbBtn.textContent = "DB Ready";
    createDbBtn.classList.add("text-green-600");
    createDbBtn.disabled = true;
  }
}

function handleDbError(event) {
  console.error("[EventHandlers] Database error:", event.detail);
  alert(`Database error: ${event.detail.error}`);
}

function handleLeadCreate(event) {
  // console.log("[EventHandlers] Creating lead:", event.detail);

  if (!isDbReady || !dbWorker) {
    alert("Database not ready yet. Please wait.");
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
  // console.log("[EventHandlers] Lead created successfully:", event.detail);
  showNotification("Lead created successfully!", "success");
  const currentTab = sessionStorage.getItem("currentTab");
  if (currentTab === "/leads") {
    dbWorker.postMessage({ action: "getAllLeads" });
  }
}

function handleLeadDelete(event) {
  // console.log("[EventHandlers] Deleting lead:", event.detail);
  console.log(event);
  dbWorker.postMessage({ action: "deleteLead", id: event.detail.id });
}

function handleModalClose(event) {
  // console.log("[EventHandlers] Modal closed:", event.detail);
}

function handleThemeToggle(event) {
  const { theme } = event.detail;
  const root = document.documentElement;

  root.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);

  // console.log("[EventHandlers] Theme changed to:", theme);
}

function showNotification(message, type = "info") {
  if (type === "success") {
    console.log(` ${message}`);
  } else if (type === "error") {
    console.error(` ${message}`);
  }
}

function connectWs(event) {}

function showMessage(event) {
  const payload = event?.detail || event;
  const message = payload?.message ?? payload;
  console.log("inside event bus:", message);
  const messages = document.getElementById("messages");
  if (!messages) return;
  messages.textContent += `\n${message}`;
  messages.scrollTop = messages.scrollHeight;
}
