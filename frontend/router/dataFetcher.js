import { populateHome } from "../controllers/populateHome.js";
import { populateLeadsTable } from "../controllers/populateLeads.js";
import { populateOrganizationsTable } from "../controllers/populateOrganizations.js";
import { populateDealsTable } from "../controllers/populateDeals.js";
import { populateUsersTable } from "../controllers/populateUsers.js";
import { populateTenantsTable } from "../controllers/populateTenants.js";

export class DataFetcher {
  constructor() {
    this.dbWorker = null;
  }

  setDbWorker(worker) {
    this.dbWorker = worker;
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
    } else if (storeName === "Tenants" && currentPath === "/tenants") {
      this.tenantsData = rows || [];
      if (this.usersData) {
        populateTenantsTable(this.tenantsData, this.usersData);
      }
    } else if (storeName === "Users" && currentPath === "/tenants") {
      this.usersData = rows || [];
      if (this.tenantsData) {
        populateTenantsTable(this.tenantsData, this.usersData);
      }
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
    } else if (currentPath === "/tenants" && storeName === "Tenants") {
      this.dbWorker.postMessage({ action: "getAllTenants" });
      this.dbWorker.postMessage({ action: "getAllUsers" });
    }
  }

  async handleOtherActions(data, currentPath) {
    const { action } = data;

    if (action === "getDataSuccess") {
      populateHome(data);
    }

    if (action === "convertToDealSuccess") {
      alert("Lead successfully converted to Deal!");
      window.location.href = "/deals";
    }

    if (action === "convertToDealError") {
      alert("Error converting lead to deal: " + data.error);
    }
    if (
      action === "tenantCreated" ||
      action === "tenantUpdated" ||
      action === "tenantDeleted"
    ) {
      if (currentPath === "/tenants") {
        this.dbWorker.postMessage({ action: "getAllTenants" });
        this.dbWorker.postMessage({ action: "getAllUsers" });
      }
    }

    if (action === "getByIdSuccess" && data.storeName === "Tenants") {
      const { openTenantModalForEdit } =
        await import("../events/handlers/tenantHandlers.js");
      openTenantModalForEdit(data.row);
    }
  }
}
