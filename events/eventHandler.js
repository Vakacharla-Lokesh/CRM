import { eventBus, EVENTS } from "./eventBus.js";
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

  // console.log("[EventHandlers] All event handlers initialized");
}

function handleDbReady(event) {
  // console.log("[EventHandlers] Database ready");
  isDbReady = true;

  const createDbBtn = document.getElementById("data-createDb");
  if (createDbBtn) {
    createDbBtn.textContent = "DB Ready ✓";
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
  // Implement delete logic here
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
    console.log(`✓ ${message}`);
  } else if (type === "error") {
    console.error(`✗ ${message}`);
  }
}
