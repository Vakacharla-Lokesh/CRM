import { populateHome } from "./services/populateHome.js";
import { populateLeadsTable } from "./services/populateLeads.js";
import { populateOrganizationsTable } from "./services/populateOrganizations.js";
import { initializeDealsPage } from "./js/deals.js";
import { populateDealsTable } from "./services/populateDeals.js";

const routes = {
  "/": "/pages/home.html",
  "/home": "/pages/home.html",
  "/leads": "/pages/leads.html",
  "/organizations": "/pages/organizations.html",
  "/deals": "/pages/deals.html",
  "/leadsDetails": "/pages/leadDetailPage.html",
  "/login": "/pages/login.html",
  "/signup": "/pages/signup.html",
};

// Routes that need script loading
const routeScripts = {
  "/login": "/js/login.js",
  "/signup": "/js/signup.js",
  "/deals": "/js/deals.js",
};

let sidebar = null;
let loadedScripts = new Set();

function attachDbWorkerListener() {
  const dbWorker = window.dbWorker;
  if (!dbWorker) {
    console.warn("dbWorker not available yet");
    return;
  }

  dbWorker.addEventListener("message", (e) => {
    const { action, storeName, rows, data, error } = e.data;
    const currentPath = sessionStorage.getItem("currentTab");

    if (
      action === "getAllSuccess" &&
      storeName === "Leads" &&
      currentPath === "/leads"
    ) {
      populateLeadsTable(rows || []);
    } else if (
      action === "getAllSuccess" &&
      storeName === "Organizations" &&
      currentPath === "/organizations"
    ) {
      populateOrganizationsTable(rows || []);
    } else if (
      action === "getAllSuccess" &&
      storeName === "Deals" &&
      currentPath === "/deals"
    ) {
      console.log("Inside populate deals");
      populateDealsTable(rows || []);
    } else if (
      action === "getAllSuccess" &&
      storeName === "Leads" &&
      currentPath === "/deals"
    ) {
      const leadSelect = document.getElementById("lead_id");
      if (leadSelect) {
        const currentValue = leadSelect.value;
        leadSelect.innerHTML = '<option value="">Select a Lead</option>';
        (data || []).forEach((lead) => {
          const option = document.createElement("option");
          option.value = lead.lead_id;
          option.textContent = `${lead.lead_first_name} ${lead.lead_last_name}`;
          leadSelect.appendChild(option);
        });
        if (currentValue) {
          leadSelect.value = currentValue;
        }
      }
    } else if (
      action === "getAllSuccess" &&
      storeName === "Organizations" &&
      currentPath === "/deals"
    ) {
      const orgSelect = document.getElementById("organization_id");
      if (orgSelect) {
        const currentValue = orgSelect.value;
        orgSelect.innerHTML = '<option value="">Select an Organization</option>';
        (data || []).forEach((org) => {
          const option = document.createElement("option");
          option.value = org.organization_id;
          option.textContent = org.organization_name;
          orgSelect.appendChild(option);
        });
        if (currentValue) {
          orgSelect.value = currentValue;
        }
      }
    } else if (action === "getDataSuccess") {
      populateHome(e.data);
    }

    if (action === "getAllError") {
      console.error("Error fetching data:", error);
      const tbody = document.querySelector(`#${storeName.toLowerCase()}-body`);
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="px-6 py-4 text-center text-red-600 dark:text-red-400">
              Error loading data: ${error}
            </td>
          </tr>
        `;
      }
    }
    if (action === "deleteSuccess") {
      const currentPath = sessionStorage.getItem("currentTab");
      if (currentPath === "/leads") {
        dbWorker.postMessage({ action: "getAllLeads" });
      } else if (currentPath === "/organizations") {
        dbWorker.postMessage({ action: "getAllOrganizations" });
      } else if (currentPath === "/deals") {
        dbWorker.postMessage({ action: "getAllDeals" });
      }
    }
  });
}

attachDbWorkerListener();

async function loadPageScript(path) {
  const scriptPath = routeScripts[path];
  if (!scriptPath) return;

  loadedScripts.forEach((scriptUrl) => {
    const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
    if (existingScript) {
      existingScript.remove();
    }
  });
  loadedScripts.clear();

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = scriptPath;
    script.onload = () => {
      loadedScripts.add(scriptPath);
      resolve();
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export async function loadRoute(path) {
  const route = routes[path] || routes["/home"];
  const sidebar = document.getElementById("default-sidebar");

  try {
    const response = await fetch(route);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const mainPage = document.getElementById("main-page");

    if (mainPage) {
      mainPage.innerHTML = html;
    }

    // Load page-specific scripts
    await loadPageScript(path);

    setTimeout(() => {
      const db = window.dbWorker;
      if (!db) {
        console.warn("Database worker not ready");
        return;
      }

      if (path === "/leads") {
        db.postMessage({ action: "getAllLeads" });
      } else if (path === "/organizations") {
        db.postMessage({ action: "getAllOrganizations" });
      } else if (path === "/deals") {
        // initializeDealsPage(db);
        db.postMessage({ action: "getAllDeals" });
      } else if (path === "/home") {
        db.postMessage({ action: "getData" });
      }
    }, 100);

    sessionStorage.setItem("currentTab", path);
    updateSidebarActiveState(path);
  } catch (error) {
    console.error("Error loading route:", error);
    const mainPage = document.getElementById("main-page");
    if (mainPage) {
      mainPage.innerHTML = `
        <div class="p-8 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <h2 class="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Error Loading Page</h2>
          <p class="text-red-600 dark:text-red-300">${error.message}</p>
          <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Reload Page
          </button>
        </div>
      `;
    }
  }
}

function updateSidebarActiveState(path) {
  const sidebarElement = document.getElementById("sidebar");
  if (!sidebarElement) return;

  const links = sidebarElement.querySelectorAll("a[data-link]");
  links.forEach((link) => {
    const linkPath = link.getAttribute("data-link");

    if (linkPath === path) {
      link.classList.remove("text-gray-700", "dark:text-gray-300");
      link.classList.add(
        "bg-blue-100",
        "dark:bg-blue-900",
        "text-blue-600",
        "dark:text-blue-300",
        "font-medium",
      );
    } else {
      link.classList.remove(
        "bg-blue-100",
        "dark:bg-blue-900",
        "text-blue-600",
        "dark:text-blue-300",
        "font-medium",
      );
      link.classList.add("text-gray-700", "dark:text-gray-300");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  sidebar = document.getElementById("default-sidebar");

  if (sidebar) {
    sidebar.addEventListener("click", (event) => {
      const link = event.target.closest("a[data-link]");
      if (!link) return;

      event.preventDefault();
      const path = link.getAttribute("data-link");
      loadRoute(path);
    });
  }

  const savedTab = sessionStorage.getItem("currentTab") || "/home";
  loadRoute(savedTab);

  window.addEventListener("popstate", () => {
    const path = window.location.pathname;
    if (routes[path]) {
      loadRoute(path);
    }
  });

  window.router = { loadRoute };
});
