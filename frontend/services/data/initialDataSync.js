import { apiClient, API_ENDPOINTS } from "../api/apiClient.js";
import { dbState } from "../state/dbState.js";
import { showNotification } from "../../events/notificationEvents.js";

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
    const [leadsResponse, organizationsResponse, dealsResponse, usersResponse] =
      await Promise.all([
        apiClient.get(API_ENDPOINTS.LEADS.GET_ALL).catch((err) => {
          console.error("Failed to fetch leads:", err);
          return { leads: [] };
        }),
        apiClient.get(API_ENDPOINTS.ORGANIZATIONS.GET_ALL).catch((err) => {
          console.error("Failed to fetch organizations:", err);
          return { organizations: [] };
        }),
        apiClient.get(API_ENDPOINTS.DEALS.GET_ALL).catch((err) => {
          console.error("Failed to fetch deals:", err);
          return { deals: [] };
        }),
        apiClient.get(API_ENDPOINTS.USERS.GET_ALL).catch((err) => {
          console.error("Failed to fetch users:", err);
          return { users: [] };
        }),
      ]);

    console.log("Raw API Responses:", {
      leadsResponse,
      organizationsResponse,
      dealsResponse,
      usersResponse,
    });

    const leadsData = leadsResponse.leads || [];
    const organizationsData = organizationsResponse.organizations || [];
    const dealsData = dealsResponse.deals || [];
    const usersData = usersResponse.users || [];

    console.log("API Data fetched:", {
      leads: leadsData.length,
      organizations: organizationsData.length,
      deals: dealsData.length,
      users: usersData.length,
    });

    const transformedLeads = leadsData.map(transformLeadFromBackend);
    const transformedOrganizations = organizationsData.map(
      transformOrganizationFromBackend,
    );
    const transformedDeals = dealsData.map(transformDealFromBackend);
    const transformedUsers = usersData.map(transformUserFromBackend);

    const filteredLeads = filterDataByUserAndTenant(
      transformedLeads,
      user_id,
      tenant_id,
      role,
    );
    const filteredOrganizations = filterDataByUserAndTenant(
      transformedOrganizations,
      user_id,
      tenant_id,
      role,
    );
    const filteredDeals = filterDataByUserAndTenant(
      transformedDeals,
      user_id,
      tenant_id,
      role,
    );
    const filteredUsers = filterDataByUserAndTenant(
      transformedUsers,
      user_id,
      tenant_id,
      role,
    );

    await clearAndPopulateStore(dbWorker, "Leads", filteredLeads);
    await clearAndPopulateStore(
      dbWorker,
      "Organizations",
      filteredOrganizations,
    );
    await clearAndPopulateStore(dbWorker, "Deals", filteredDeals);
    await clearAndPopulateStore(dbWorker, "Users", filteredUsers);

    showNotification(
      `Data synced successfully! ${filteredLeads.length} leads, ${filteredOrganizations.length} organizations, ${filteredDeals.length} deals loaded.`,
      "success",
    );

    console.log("Initial data sync completed:", {
      leads: filteredLeads.length,
      organizations: filteredOrganizations.length,
      deals: filteredDeals.length,
      users: filteredUsers.length,
    });

    return true;
  } catch (error) {
    console.error("Failed to sync data on login:", error);
    showNotification(
      "Failed to sync data from server. Working offline.",
      "warning",
    );
    return false;
  }
}

function filterDataByUserAndTenant(data, user_id, tenant_id, role) {
  if (!Array.isArray(data)) {
    return [];
  }

  if (role === "super_admin") {
    return data;
  }

  if (role === "admin") {
    return data.filter((item) => String(item.tenant_id) === String(tenant_id));
  }

  return data.filter(
    (item) =>
      String(item.tenant_id) === String(tenant_id) &&
      String(item.user_id) === String(user_id),
  );
}

function clearAndPopulateStore(dbWorker, storeName, data) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout clearing and populating ${storeName}`));
    }, 10000);

    const handler = (e) => {
      if (
        e.data.storeName === storeName &&
        e.data.action === "clearAndPopulateSuccess"
      ) {
        clearTimeout(timeout);
        dbWorker.removeEventListener("message", handler);
        resolve();
      } else if (
        e.data.storeName === storeName &&
        e.data.action === "clearAndPopulateError"
      ) {
        clearTimeout(timeout);
        dbWorker.removeEventListener("message", handler);
        reject(new Error(e.data.error));
      }
    };

    dbWorker.addEventListener("message", handler);

    dbWorker.postMessage({
      action: "clearAndPopulate",
      storeName,
      data,
    });
  });
}

export async function syncSingleEntityToBackend(entityType, data, operation) {
  try {
    let response;

    switch (entityType) {
      case "leads":
        if (operation === "create") {
          response = await apiClient.post(API_ENDPOINTS.LEADS.CREATE, data);
        } else if (operation === "update") {
          response = await apiClient.put(
            API_ENDPOINTS.LEADS.UPDATE(data.lead_id),
            data,
          );
        } else if (operation === "delete") {
          response = await apiClient.delete(
            API_ENDPOINTS.LEADS.DELETE(data.lead_id),
          );
        }
        break;

      case "organizations":
        if (operation === "create") {
          const apiData = transformToApiFormat(data, "organization");
          response = await apiClient.post(
            API_ENDPOINTS.ORGANIZATIONS.CREATE,
            apiData,
          );
        } else if (operation === "update") {
          const apiData = transformToApiFormat(data, "organization");
          const mongoId = data._id || data.organization_id;
          response = await apiClient.put(
            API_ENDPOINTS.ORGANIZATIONS.UPDATE(mongoId),
            apiData,
          );
        } else if (operation === "delete") {
          const mongoId = data._id || data.organization_id;
          response = await apiClient.delete(
            API_ENDPOINTS.ORGANIZATIONS.DELETE(mongoId),
          );
        }
        break;

      case "deals":
        if (operation === "create") {
          response = await apiClient.post(API_ENDPOINTS.DEALS.CREATE, data);
        } else if (operation === "update") {
          response = await apiClient.put(
            API_ENDPOINTS.DEALS.UPDATE(data.deal_id),
            data,
          );
        } else if (operation === "delete") {
          response = await apiClient.delete(
            API_ENDPOINTS.DEALS.DELETE(data.deal_id),
          );
        }
        break;

      case "users":
        if (operation === "create") {
          response = await apiClient.post(API_ENDPOINTS.USERS.CREATE, data);
        } else if (operation === "update") {
          response = await apiClient.put(
            API_ENDPOINTS.USERS.UPDATE(data.user_id),
            data,
          );
        } else if (operation === "delete") {
          response = await apiClient.delete(
            API_ENDPOINTS.USERS.DELETE(data.user_id),
          );
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

function transformOrganizationFromBackend(org) {
  return {
    organization_id: org._id,
    _id: org._id,
    organization_name: org.organizationName,
    organization_website_name: org.organizationWebsite,
    organization_size: org.organizationSize?.toString() || "",
    organization_industry: org.organizationIndustry,
    tenant_id: org.tenantId,
    user_id: org.userId,
    created_on: org.createdAt,
    modified_on: org.updatedAt,
  };
}

function transformLeadFromBackend(lead) {
  return {
    lead_id: lead._id,
    _id: lead._id,
    lead_name: `${lead.leadFirstName || ""} ${lead.leadLastName || ""}`.trim(),
    lead_first_name: lead.leadFirstName,
    lead_last_name: lead.leadLastName,
    lead_email: lead.leadEmail,
    lead_source: lead.leadSource,
    lead_status: lead.leadStatus,
    lead_score: lead.leadScore,
    organization_id: lead.organizationId,
    tenant_id: lead.tenantId,
    user_id: lead.userId,
    created_on: lead.createdAt,
    modified_on: lead.updatedAt,
  };
}

function transformDealFromBackend(deal) {
  return {
    deal_id: deal._id,
    _id: deal._id,
    deal_name: deal.dealName,
    deal_value: deal.dealValue,
    deal_status: deal.dealStatus,
    deal_stage: deal.dealStatus, // Using dealStatus as dealStage
    lead_id: deal.leadId,
    organization_id: deal.organizationId,
    tenant_id: deal.tenantId,
    user_id: deal.userId,
    created_on: deal.createdAt,
    modified_on: deal.updatedAt,
  };
}

function transformUserFromBackend(user) {
  return {
    user_id: user._id,
    _id: user._id,
    user_name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    first_name: user.firstName,
    last_name: user.lastName,
    user_email: user.userEmail,
    mobile: user.mobile,
    role: user.role,
    tenant_id: user.tenantId,
    created_on: user.createdAt,
    modified_on: user.updatedAt,
  };
}

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
