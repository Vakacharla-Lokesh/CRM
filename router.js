import { populateHome } from "./services/populateHome.js";
import { populateLeadsTable } from "./services/populateLeads.js";
import { populateOrganizationsTable } from "./services/populateOrganizations.js";

const routes = {
  "/": "/pages/home.html",
  "/home": "/pages/home.html",
  "/leads": "/pages/leads.html",
  "/organizations": "/pages/organizations.html",
  "/deals": "/pages/deals.html",
  "/leads/id": "/pages/leadDetailPage.html",
  "/login": "/pages/login.html",
  "/signup": "/pages/signup.html",
};

// Routes where sidebar should be hidden
// const hideSidebarRoutes = ["/login", "/signup"];

let sidebar = null;

function attachDbWorkerListener() {
  const dbWorker = window.dbWorker;
  if (!dbWorker) {
    console.warn("dbWorker not available yet");
    return;
  }

  dbWorker.addEventListener("message", (e) => {
    const { action, storeName, rows, error } = e.data;

    // Handle successful data retrieval
    if (action === "getAllSuccess" && storeName === "Leads") {
      populateLeadsTable(rows || []);
    } else if (action === "getAllSuccess" && storeName === "Organizations") {
      populateOrganizationsTable(rows || []);
    } else if (action === "getDataSuccess") {
      populateHome(e.data);
    }

    // Handle errors
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

    // Handle delete success - refresh the current view
    if (action === "deleteSuccess") {
      const currentPath = sessionStorage.getItem("currentTab");
      if (currentPath === "/leads") {
        dbWorker.postMessage({ action: "getAllLeads" });
      } else if (currentPath === "/organizations") {
        dbWorker.postMessage({ action: "getAllOrganizations" });
      }
    }
  });
}

// Try to attach listener immediately
attachDbWorkerListener();

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

    // Hide sidebar on login and signup pages
    // if (sidebar) {
    //   if (hideSidebarRoutes.includes(path)) {
    //     sidebar.classList.add("hidden");
    //   } else {
    //     sidebar.classList.remove("hidden");
    //   }
    // }

    setTimeout(() => {
      const db = window.dbWorker;
      if (!db) {
        console.warn("Database worker not ready");
        return;
      }

      // Fetch data based on route
      if (path === "/leads") {
        db.postMessage({ action: "getAllLeads" });
      } else if (path === "/organizations") {
        db.postMessage({ action: "getAllOrganizations" });
      } else if (path === "/home") {
        db.postMessage({ action: "getData" });
      }
    }, 100);

    // Store current route
    sessionStorage.setItem("currentTab", path);

    // Update sidebar active state
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
      // Add active classes
      link.classList.remove("text-gray-700", "dark:text-gray-300");
      link.classList.add(
        "bg-blue-100",
        "dark:bg-blue-900",
        "text-blue-600",
        "dark:text-blue-300",
        "font-medium",
      );
    } else {
      // Remove active classes
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

// Initialize router on DOM load
document.addEventListener("DOMContentLoaded", () => {
  sidebar = document.getElementById("default-sidebar");

  if (sidebar) {
    // Sidebar click handler with event delegation
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
