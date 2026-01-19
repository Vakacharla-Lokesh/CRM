import "./components/LeadsDataRow.js";

// TO-DO WORKER THREAD
window.dbWorker = new Worker("workers\\dbWorker.js", { type: "module" });
const dbWorker = window.dbWorker;
let isDbReady = false;

let createDbButton = document.getElementById("data-createDb");

createDbButton.addEventListener("click", (event) => {
  dbWorker.postMessage({ action: "initialize" });
});

document.addEventListener("DOMContentLoaded", (event) => {
  dbWorker.postMessage({ action: "initialize" });
});

dbWorker.onmessage = (e) => {
  if (e.data.action === "dbReady") {
    console.log("Database ready");
    isDbReady = true;
  }

  if (e.data.action === "insertSuccess") {
    console.log("Lead inserted successfully");
  }

  if (e.data.action === "insertError") {
    console.error("Insert failed:", e.data.error);
  }
};

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
  const modal = document.getElementById("authentication-modal");

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
  const modal = document.getElementById("authentication-modal");
  if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) {
    modal.classList.add("hidden");
  }
});

// MODAL SUBMISSION LOGIC
document.addEventListener("submit", (event) => {
  if (!event.target.matches("form[data-form='createLead']")) return;

  event.preventDefault();

  if (!isDbReady) {
    alert("Database not ready yet. Click Create DB first.");
    return;
  }

  const leadData = {
    lead_id: Date.now(),
    lead_first_name: document.getElementById("first_name")?.value,
    lead_last_name: document.getElementById("last_name")?.value,
    lead_email: document.getElementById("email")?.value,
    lead_mobile_number: document.getElementById("mobile_number")?.value,
    organizationName: document.getElementById("organization_name")?.value,
    websiteName: document.getElementById("organization_website_name")?.value,
    organizationSize: document.getElementById("organization_size")?.value,
    industry: document.getElementById("organization_industry")?.value,
  };

  dbWorker.postMessage({
    action: "createLead",
    leadData,
  });

  document.getElementById("authentication-modal").classList.add("hidden");
});
