import { populateHome } from "../controllers/populateHome.js";
import { populateLeadsTable } from "../controllers/populateLeads.js";
import { populateOrganizationsTable } from "../controllers/populateOrganizations.js";
import { populateDealsTable } from "../controllers/populateDeals.js";
import { populateUsersTable } from "../controllers/populateUsers.js";
import { updateUserDetails } from "../events/userProfile.js";

export class DataFetcher {
  constructor() {
    this.dbWorker = null;
  }

  setDbWorker(worker) {
    this.dbWorker = worker;
  }

  fetchDataForRoute(path) {
    if (!this.dbWorker) {
      console.warn("Database worker not ready");
      return;
    }

    console.log("Fetching data for route:", path);

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      console.warn("No user found in localStorage");
      return;
    }

    const { user_id, tenant_id, role } = user;

    switch (path) {
      case "/leads":
        this.dbWorker.postMessage({
          action: "getAllLeads",
          user_id,
          tenant_id,
          role,
        });
        break;

      case "/organizations":
        this.dbWorker.postMessage({
          action: "getAllOrganizations",
          user_id,
          tenant_id,
          role,
        });
        break;

      case "/deals":
        this.dbWorker.postMessage({
          action: "getAllDeals",
          user_id,
          tenant_id,
          role,
        });
        break;

      case "/users":
        if (role === "admin" || role === "super_admin") {
          this.dbWorker.postMessage({
            action: "getAllUsers",
            tenant_id,
            role,
          });
        }
        break;

      case "/home":
        this.dbWorker.postMessage({
          action: "getData",
          user_id,
          tenant_id,
          role,
        });
        break;

      default:
        console.log("No data fetch needed for:", path);
        break;
    }

    if (path !== "/login" && path !== "/signup") {
      updateUserDetails();
    }
  }

  handleDbWorkerMessage(data, currentPath) {
    const { action, storeName, rows, error } = data;

    console.log("DB Worker Message:", { action, storeName, currentPath });

    if (action === "getAllSuccess") {
      this.handleGetAllSuccess(storeName, rows, currentPath);
    }

    if (action === "getAllError") {
      this.handleGetAllError(storeName, error);
    }

    if (action === "deleteSuccess") {
      this.handleDeleteSuccess(storeName, currentPath);
    }
    this.handleOtherActions(data, currentPath);
  }

  handleGetAllSuccess(storeName, rows, currentPath) {
    console.log("HandleGetAllSuccess:", {
      storeName,
      rowCount: rows?.length,
      currentPath,
    });

    if (storeName === "Leads" && currentPath === "/leads") {
      populateLeadsTable(rows || []);
    } else if (
      storeName === "Organizations" &&
      currentPath === "/organizations"
    ) {
      console.log("Inside populate organizations: ");
      populateOrganizationsTable(rows || []);
    } else if (storeName === "Deals" && currentPath === "/deals") {
      populateDealsTable(rows || []);
    } else if (storeName === "Users" && currentPath === "/users") {
      populateUsersTable(rows || []);
    }
  }

  handleGetAllError(storeName, error) {
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

  handleDeleteSuccess(storeName, currentPath) {
    if (currentPath === "/leads" && storeName === "Leads") {
      this.dbWorker.postMessage({ action: "getAllLeads" });
    } else if (
      currentPath === "/organizations" &&
      storeName === "Organizations"
    ) {
      this.dbWorker.postMessage({ action: "getAllOrganizations" });
    } else if (currentPath === "/deals" && storeName === "Deals") {
      this.dbWorker.postMessage({ action: "getAllDeals" });
    } else if (currentPath === "/users" && storeName === "Users") {
      this.dbWorker.postMessage({ action: "getAllUsers" });
    }
  }

  handleOtherActions(data, currentPath) {
    const { action } = data;

    if (action === "getDataSuccess") {
      populateHome(data);
    }

    if (action === "convertToDealSuccess") {
      alert("Lead successfully converted to Deal!");
      if (window.router && window.router.loadRoute) {
        window.router.loadRoute("/deals");
      }
    }

    if (action === "convertToDealError") {
      alert("Error converting lead to deal: " + data.error);
    }
  }
}
