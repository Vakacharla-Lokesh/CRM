import { apiClient, API_ENDPOINTS } from "../api/apiClient.js";
import { dbState } from "../state/dbState.js";
import { showNotification } from "../../events/notificationEvents.js";

/**
 * Syncs all data from backend to IndexedDB on login
 * @param {object} user - User object with user_id, tenant_id, role
 * @returns {Promise<boolean>} - Success status
 */
export async function syncAllDataOnLogin(user) {
  const { dbWorker, isDbReady } = dbState;

  if (!isDbReady || !dbWorker) {
    console.error("Database not ready for initial sync");
    return false;
  }

  if (!user || !user.user_id || !user.tenant_id) {
    console.error("Invalid user data for sync");
    return false;
  }

  const { user_id, tenant_id, role } = user;
  
  showNotification("Syncing data from server...", "info");

  try {
    // Fetch all data in parallel
    const [leadsResponse, organizationsResponse, dealsResponse, usersResponse] = await Promise.all([
      apiClient.get(API_ENDPOINTS.LEADS.GET_ALL).catch(err => {
        console.error("Failed to fetch leads:", err);
        return { data: [] };
      }),
      apiClient.get(API_ENDPOINTS.ORGANIZATIONS.GET_ALL).catch(err => {
        console.error("Failed to fetch organizations:", err);
        return { data: [] };
      }),
      apiClient.get(API_ENDPOINTS.DEALS.GET_ALL).catch(err => {
        console.error("Failed to fetch deals:", err);
        return { data: [] };
      }),
      apiClient.get(API_ENDPOINTS.USERS.GET_ALL).catch(err => {
        console.error("Failed to fetch users:", err);
        return { data: [] };
      })
    ]);

    // Extract data arrays
    const leadsData = leadsResponse.data || leadsResponse || [];
    const organizationsData = organizationsResponse.data || organizationsResponse || [];
    const dealsData = dealsResponse.data || dealsResponse || [];
    const usersData = usersResponse.data || usersResponse || [];

    // Filter data based on user role and tenant
    const filteredLeads = filterDataByUserAndTenant(leadsData, user_id, tenant_id, role);
    const filteredOrganizations = filterDataByUserAndTenant(organizationsData, user_id, tenant_id, role);
    const filteredDeals = filterDataByUserAndTenant(dealsData, user_id, tenant_id, role);
    const filteredUsers = filterDataByUserAndTenant(usersData, user_id, tenant_id, role);

    // Clear and populate IndexedDB stores
    await clearAndPopulateStore(dbWorker, "Leads", filteredLeads);
    await clearAndPopulateStore(dbWorker, "Organizations", filteredOrganizations);
    await clearAndPopulateStore(dbWorker, "Deals", filteredDeals);
    await clearAndPopulateStore(dbWorker, "Users", filteredUsers);

    showNotification(`Data synced successfully! ${filteredLeads.length} leads, ${filteredOrganizations.length} organizations, ${filteredDeals.length} deals loaded.`, "success");
    
    console.log("Initial data sync completed:", {
      leads: filteredLeads.length,
      organizations: filteredOrganizations.length,
      deals: filteredDeals.length,
      users: filteredUsers.length
    });

    return true;
  } catch (error) {
    console.error("Failed to sync data on login:", error);
    showNotification("Failed to sync data from server. Working offline.", "warning");
    return false;
  }
}

/**
 * Filter data based on user role and tenant
 * @param {Array} data - Data array to filter
 * @param {string} user_id - User ID
 * @param {string} tenant_id - Tenant ID
 * @param {string} role - User role (admin, user, etc.)
 * @returns {Array} - Filtered data
 */
function filterDataByUserAndTenant(data, user_id, tenant_id, role) {
  if (!Array.isArray(data)) {
    return [];
  }

  // Super admin sees all data
  if (role === "super_admin") {
    return data;
  }

  // Admin sees all data for their tenant
  if (role === "admin") {
    return data.filter(item => String(item.tenant_id) === String(tenant_id));
  }

  // Regular users see only their own data within their tenant
  return data.filter(item => 
    String(item.tenant_id) === String(tenant_id) && 
    String(item.user_id) === String(user_id)
  );
}

/**
 * Clear a store and populate it with new data
 * @param {Worker} dbWorker - Database worker instance
 * @param {string} storeName - Name of the store
 * @param {Array} data - Data to populate
 * @returns {Promise<void>}
 */
function clearAndPopulateStore(dbWorker, storeName, data) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout clearing and populating ${storeName}`));
    }, 10000);

    const handler = (e) => {
      if (e.data.storeName === storeName && e.data.action === "clearAndPopulateSuccess") {
        clearTimeout(timeout);
        dbWorker.removeEventListener("message", handler);
        resolve();
      } else if (e.data.storeName === storeName && e.data.action === "clearAndPopulateError") {
        clearTimeout(timeout);
        dbWorker.removeEventListener("message", handler);
        reject(new Error(e.data.error));
      }
    };

    dbWorker.addEventListener("message", handler);
    
    dbWorker.postMessage({
      action: "clearAndPopulate",
      storeName,
      data
    });
  });
}

/**
 * Sync single entity to backend
 * @param {string} entityType - Type of entity (leads, organizations, deals, users)
 * @param {object} data - Entity data
 * @param {string} operation - Operation type (create, update, delete)
 * @returns {Promise<object>} - API response
 */
export async function syncSingleEntityToBackend(entityType, data, operation) {
  try {
    let response;
    
    switch (entityType) {
      case "leads":
        if (operation === "create") {
          response = await apiClient.post(API_ENDPOINTS.LEADS.CREATE, data);
        } else if (operation === "update") {
          response = await apiClient.put(API_ENDPOINTS.LEADS.UPDATE(data.lead_id), data);
        } else if (operation === "delete") {
          response = await apiClient.delete(API_ENDPOINTS.LEADS.DELETE(data.lead_id));
        }
        break;
        
      case "organizations":
        if (operation === "create") {
          const apiData = transformToApiFormat(data, "organization");
          response = await apiClient.post(API_ENDPOINTS.ORGANIZATIONS.CREATE, apiData);
        } else if (operation === "update") {
          const apiData = transformToApiFormat(data, "organization");
          const mongoId = data._id || data.organization_id;
          response = await apiClient.put(API_ENDPOINTS.ORGANIZATIONS.UPDATE(mongoId), apiData);
        } else if (operation === "delete") {
          const mongoId = data._id || data.organization_id;
          response = await apiClient.delete(API_ENDPOINTS.ORGANIZATIONS.DELETE(mongoId));
        }
        break;
        
      case "deals":
        if (operation === "create") {
          response = await apiClient.post(API_ENDPOINTS.DEALS.CREATE, data);
        } else if (operation === "update") {
          response = await apiClient.put(API_ENDPOINTS.DEALS.UPDATE(data.deal_id), data);
        } else if (operation === "delete") {
          response = await apiClient.delete(API_ENDPOINTS.DEALS.DELETE(data.deal_id));
        }
        break;
        
      case "users":
        if (operation === "create") {
          response = await apiClient.post(API_ENDPOINTS.USERS.CREATE, data);
        } else if (operation === "update") {
          response = await apiClient.put(API_ENDPOINTS.USERS.UPDATE(data.user_id), data);
        } else if (operation === "delete") {
          response = await apiClient.delete(API_ENDPOINTS.USERS.DELETE(data.user_id));
        }
        break;
        
      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }
    
    return response;
  } catch (error) {
    console.error(`Failed to sync ${entityType} to backend:`, error);
    throw error;
  }
}

/**
 * Transform data to API format (snake_case to camelCase where needed)
 * @param {object} data - Data to transform
 * @param {string} type - Type of data
 * @returns {object} - Transformed data
 */
function transformToApiFormat(data, type) {
  if (type === "organization") {
    const apiData = {
      organizationName: data.organization_name,
    };
    
    if (data.organization_website_name) {
      apiData.organizationWebsite = data.organization_website_name;
    }
    if (data.organization_industry) {
      apiData.organizationIndustry = data.organization_industry;
    }
    if (data.organization_size) {
      apiData.organizationSize = parseInt(data.organization_size, 10);
    }
    
    return apiData;
  }
  
  return data;
}
