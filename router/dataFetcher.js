import { populateHome } from "../services/populateHome.js";
import { populateLeadsTable } from "../services/populateLeads.js";
import { populateOrganizationsTable } from "../services/populateOrganizations.js";
import { populateDealsTable } from "../services/populateDeals.js";
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

    switch (path) {
      case "/leads":
        console.log("Inside dataFetcher switch: ");
        this.dbWorker.postMessage({ action: "getAllLeads" });
        break;

      case "/organizations":
        this.dbWorker.postMessage({ action: "getAllOrganizations" });
        break;

      case "/deals":
        this.dbWorker.postMessage({ action: "getAllDeals" });
        break;

      case "/home":
        this.dbWorker.postMessage({ action: "getData" });
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

    // Handle errors
    if (action === "getAllError") {
      this.handleGetAllError(storeName, error);
    }

    // Handle delete success
    if (action === "deleteSuccess") {
      this.handleDeleteSuccess(storeName, currentPath);
    }

    // Handle other actions
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
      populateOrganizationsTable(rows || []);
    } else if (storeName === "Deals" && currentPath === "/deals") {
      populateDealsTable(rows || []);
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
    // Refresh data after delete
    if (currentPath === "/leads" && storeName === "Leads") {
      this.dbWorker.postMessage({ action: "getAllLeads" });
    } else if (
      currentPath === "/organizations" &&
      storeName === "Organizations"
    ) {
      this.dbWorker.postMessage({ action: "getAllOrganizations" });
    } else if (currentPath === "/deals" && storeName === "Deals") {
      this.dbWorker.postMessage({ action: "getAllDeals" });
    }
  }

  handleOtherActions(data, currentPath) {
    const { action } = data;

    // Handle home page data
    if (action === "getDataSuccess") {
      populateHome(data);
    }

    // Handle convert to deal
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
