import { populateHome } from "./services/populateHome.js";
import { populateLeadsTable } from "./services/populateLeads.js";
import { populateOrganizationsTable } from "./services/populateOrganizations.js";

let routes = {
  "/": "index.html",
  "/home": "/pages/home.html",
  "/leads": "/pages/leads.html",
  "/organizations": "/pages/organizations.html",
  "/deals": "/pages/deals.html",
};

let sidebar = document.getElementById("sidebar");
const dbWorker = window.dbWorker;

dbWorker.onmessage = (e) => {
  // console.log("Router received message:", e.data);

  if (e.data.action === "getAllSuccess" && e.data.storeName === "Leads") {
    // console.log("Populating leads table with:", e.data.leads.length, "leads");
    populateLeadsTable(e.data.rows);
  } else if (
    e.data.action === "getAllSuccess" &&
    e.data.storeName === "Organizations"
  ) {
    // console.log(e.data);
    // console.log("Populating organizations table with:", e.data.rows.length, "organizations");
    populateOrganizationsTable(e.data.rows);
  } else if (e.data.action === "getDataSuccess") {
    // console.log(e.data);
    populateHome(e.data);
  }

  if (e.data.action === "getAllError") {
    console.error("Error fetching leads:", e.data.error);
    const tbody = document.querySelector("#leads-body");
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="px-6 py-4 text-center text-red-600 dark:text-red-400">
            Error loading leads: ${e.data.error}
          </td>
        </tr>
      `;
    }
  }
};

async function loadRoute(path) {
  const route = routes[path] || routes["/home"];

  try {
    const html = await fetch(route).then((res) => res.text());
    document.getElementById("main-page").innerHTML = html;
    setTimeout(() => {
      if (path === "/leads") {
        // console.log("Leads page loaded, requesting data...");
        dbWorker.postMessage({ action: "getAllLeads" });
      } else if (path === "/organizations") {
        // console.log("Organizations page loaded, requesting data...");
        dbWorker.postMessage({ action: "getAllOrganizations" });
      } else if (path === "/home") {
        // console.log("Organizations page loaded, requesting data...");
        dbWorker.postMessage({ action: "getData" });
      }
    }, 100);

    sessionStorage.setItem("currentTab", path);

    sidebar.querySelectorAll("a").forEach((link) => {
      if (link.getAttribute("data-link") === path) {
        link.classList.add("bg-neutral-tertiary", "text-fg-brand");
      } else {
        link.classList.remove("bg-neutral-tertiary", "text-fg-brand");
      }
    });
  } catch (error) {
    console.error("Error loading route:", error);
    document.getElementById("main-page").innerHTML = `
      <div class="p-4 text-red-600">Error loading page: ${error.message}</div>
    `;
  }
}

sidebar.addEventListener("click", (event) => {
  event.preventDefault();
  const link = event.target.closest("a");
  if (!link) return;
  const path = link.getAttribute("data-link");
  loadRoute(path);
});

window.addEventListener("DOMContentLoaded", () => {
  const savedTab = sessionStorage.getItem("currentTab") || "/home";
  loadRoute(savedTab);
});
