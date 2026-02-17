import { populateHome } from "../controllers/populateHome.js";
import { populateLeadsTable } from "../controllers/populateLeads.js";
import { populateOrganizationsTable } from "../controllers/populateOrganizations.js";
import { populateDealsTable } from "../controllers/populateDeals.js";
import { populateUsersTable } from "../controllers/populateUsers.js";
import { populateTenantsTable } from "../controllers/populateTenants.js";
import { apiClient, API_ENDPOINTS } from "../services/api/apiClient.js";
import {
  buildIndustrySegmentMap,
  buildStatusSegmentMap,
  mapToArray,
} from "../services/data/leadSegmentation.js";
import userManager from "../events/handlers/userManager.js";

export class DataFetcher {
  constructor() {
    this.dbWorker = null;
  }

  setDbWorker(worker) {
    this.dbWorker = worker;
  }

  async scheduleDataFetch(path) {
    try {
      switch (path) {
        case "/home":
          await this.fetchHomeData();
          break;
        case "/leads":
          await this.fetchLeads();
          break;
        case "/organizations":
          await this.fetchOrganizations();
          break;
        case "/deals":
          await this.fetchDeals();
          break;
        case "/users":
          await this.fetchUsers();
          break;
        case "/tenants":
          await this.fetchTenants();
          break;
        default:
          console.log("No data fetch needed for path:", path);
      }
    } catch (error) {
      console.error("Error fetching data for path:", path, error);
      this.showErrorMessage(error.message);
    }
  }

  async fetchHomeData() {
    try {
      const user = userManager.getUser();
      if (!user) return;

      // Fetch leads and deals for dashboard calculations
      const [leads, deals] = await Promise.all([
        apiClient.get(API_ENDPOINTS.LEADS.GET_ALL),
        apiClient.get(API_ENDPOINTS.DEALS.GET_ALL),
      ]);

      // Calculate dashboard statistics
      const lead_count = leads.length;
      const wonDeals = deals.filter((deal) => deal.deal_status === "Won");
      const deals_won = wonDeals.length;
      const deals_ongoing = deals.length - deals_won;
      const deal_value_won = wonDeals.reduce(
        (sum, deal) => sum + (deal.deal_value || 0),
        0,
      );
      const totalValue = deals.reduce(
        (sum, deal) => sum + (deal.deal_value || 0),
        0,
      );
      const avg_deal_value =
        deals.length > 0 ? (totalValue / deals.length).toFixed(2) : "0";

      // Build segments
      const statusSegmentMap = buildStatusSegmentMap(leads);
      const industrySegmentMap = buildIndustrySegmentMap(leads);
      const statusSegments = mapToArray(statusSegmentMap);
      const industrySegments = mapToArray(industrySegmentMap);

      // Populate home page
      const dashboardData = {
        lead_count,
        deals_won,
        deals_ongoing,
        deal_value_won,
        avg_deal_value,
        statusSegments,
        industrySegments,
        totalLeads: leads.length,
      };

      populateHome(dashboardData);
    } catch (error) {
      console.error("Error fetching home data:", error);
      throw error;
    }
  }

  async fetchLeads() {
    try {
      const leads = await apiClient.get(API_ENDPOINTS.LEADS.GET_ALL);
      populateLeadsTable(leads || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
      throw error;
    }
  }

  async fetchOrganizations() {
    try {
      const organizations = await apiClient.get(
        API_ENDPOINTS.ORGANIZATIONS.GET_ALL,
      );
      populateOrganizationsTable(organizations || []);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      throw error;
    }
  }

  async fetchDeals() {
    try {
      const deals = await apiClient.get(API_ENDPOINTS.DEALS.GET_ALL);
      populateDealsTable(deals || []);
    } catch (error) {
      console.error("Error fetching deals:", error);
      throw error;
    }
  }

  async fetchUsers() {
    try {
      const users = await apiClient.get(API_ENDPOINTS.USERS.GET_ALL);
      populateUsersTable(users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  async fetchTenants() {
    try {
      const [tenants, users] = await Promise.all([
        apiClient.get(API_ENDPOINTS.TENANTS.GET_ALL),
        apiClient.get(API_ENDPOINTS.USERS.GET_ALL),
      ]);
      populateTenantsTable(tenants || [], users || []);
    } catch (error) {
      console.error("Error fetching tenants:", error);
      throw error;
    }
  }

  showErrorMessage(message) {
    const mainPage = document.getElementById("main-page");
    if (mainPage) {
      const errorDiv = document.createElement("div");
      errorDiv.className =
        "p-4 mb-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800";
      errorDiv.innerHTML = `
        <p class="text-red-600 dark:text-red-300">Error loading data: ${message}</p>
      `;
      mainPage.insertBefore(errorDiv, mainPage.firstChild);
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
