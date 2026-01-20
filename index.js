import "./components/LeadsDataRow.js";
import { eventBus, EVENTS } from "./events/eventBus.js";
import { initializeEventHandlers } from "./events/eventHandler.js";

window.dbWorker = new Worker("workers/dbWorker.js", { type: "module" });
const dbWorker = await window.dbWorker;
let isDbReady = false;

document.addEventListener(
  "DOMContentLoaded",
  (event) => {
    // console.log("dom content worker sent message");
    dbWorker.postMessage({ action: "initialize" });
    // console.log("worker sent message after");
  },
  { once: true },
);

initializeEventHandlers(dbWorker);

let createDbButton = document.getElementById("data-createDb");

createDbButton.addEventListener("click", (event) => {
  // console.log("Create DB button clicked");
  dbWorker.postMessage({ action: "initialize" });
});

dbWorker.addEventListener("message", (e) => {
  // console.log("Index.js received:", e.data);

  if (e.data.action === "dbReady") {
    // console.log("Database ready");
    isDbReady = true;
    createDbButton.textContent = "DB Ready";
    createDbButton.classList.remove("text-blue-300");
    createDbButton.classList.add("text-green-600");
  }

  if (e.data.action === "insertSuccess") {
    // console.log("Lead inserted successfully:", e.data.data);
    // alert("Lead created successfully!");
    // Refresh the leads list if we're on the leads page
    if (sessionStorage.getItem("currentTab") === "/leads") {
      dbWorker.postMessage({ action: "getAllLeads" });
    }else if (sessionStorage.getItem("currentTab") === "/organizations") {
      dbWorker.postMessage({ action: "getAllOrganizations" });
    }
  }

  if (e.data.action === "insertError") {
    console.error("Insert failed:", e.data.error);
    alert("Failed to create lead: " + e.data.error);
  }

  if (e.data.action === "dbError") {
    console.error("Database error:", e.data.error);
    alert("Database error: " + e.data.error);
  }
});

// THEME TOGGLE LOGIC
const root = document.documentElement;
const toggleBtn = document.getElementById("theme-toggle");
const media = window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme(theme) {
  root.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
  toggleBtn.textContent = theme === "dark" ? "☀️" : "🌙";
}

const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
  applyTheme(savedTheme);
} else {
  applyTheme(media.matches ? "dark" : "light");
}

media.addEventListener("change", (e) => {
  if (!localStorage.getItem("theme")) {
    applyTheme(e.matches ? "dark" : "light");
  }
});

toggleBtn.addEventListener("click", () => {
  const isDark = root.classList.contains("dark");
  applyTheme(isDark ? "light" : "dark");
});

// MODAL OPEN CLOSE LOGIC
document.addEventListener("click", (e) => {
  const modal = document.getElementById("form-modal");
  if (!modal) return;

  if (e.target.closest("#open-modal-btn")) {
    modal.classList.remove("hidden");
  }

  if (e.target.closest("#close-modal-btn")) {
    modal.classList.add("hidden");
  }

  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});

// MODAL ESC KEY LOGIC
document.addEventListener("keydown", (e) => {
  const modal = document.getElementById("form-modal");
  if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) {
    modal.classList.add("hidden");
  }
});

// MODAL SUBMISSION LOGIC
document.addEventListener("submit", (event) => {
  event.preventDefault();
  if (event.target.matches("form[data-form='createLead']")) {
    if (!isDbReady) {
      // alert("Database not ready yet. Please wait or click 'Create DB'.");
      dbWorker.postMessage({ action: "initialize" });
      // return;
    }

    const leadData = {
      lead_id: Date.now(),
      lead_first_name: document.getElementById("first_name")?.value || "",
      lead_last_name: document.getElementById("last_name")?.value || "",
      lead_email: document.getElementById("email")?.value || "",
      lead_mobile_number: document.getElementById("mobile_number")?.value || "",
      organization_name:
        document.getElementById("organization_name")?.value || "",
      organization_website_name:
        document.getElementById("organization_website_name")?.value || "",
      organizationSize:
        document.getElementById("organization_size")?.value || "",
      organization_industry:
        document.getElementById("organization_industry")?.value || "",
      created_on: new Date(),
      modified_on: new Date(),
    };

    // console.log("Submitting lead:", leadData);

    dbWorker.postMessage({
      action: "createLead",
      leadData,
    });

    document.getElementById("form-modal")?.classList.add("hidden");

    eventBus.emit(EVENTS.LEAD_CREATED);
    event.target.reset();
  } else if (event.target.matches("form[data-form='createOrganization']")) {
    if (!isDbReady) {
      alert("Database not ready yet. Please wait or click 'Create DB'.");
      dbWorker.postMessage({ action: "initialize" });
      // return;
    }

    const organizationData = {
      organization_id: Date.now(),
      organization_name:
        document.getElementById("organization_name")?.value || "",
      organization_website_name:
        document.getElementById("organization_website_name")?.value || "",
      organization_size:
        document.getElementById("organization_size")?.value || "",
      organization_industry:
        document.getElementById("organization_industry")?.value || "",
      created_on: new Date(),
      modified_on: new Date(),
    };

    // console.log("Submitting organization:", organizationData);

    dbWorker.postMessage({
      action: "createOrganization",
      organizationData,
    });

    document.getElementById("form-modal")?.classList.add("hidden");

    eventBus.emit(EVENTS.ORGANIZATION_CREATED);
    event.target.reset();
  }
});
