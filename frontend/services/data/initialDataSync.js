import { apiClient, API_ENDPOINTS } from "../api/apiClient.js";
import { dbState } from "../state/dbState.js";
import { showNotification } from "../../events/notificationEvents.js";

export async function syncAllDataOnLogin(user) {
  const { dbWorker, isDbReady } = dbState;

  if (!isDbReady || !dbWorker) {
    console.error("Database not ready for initial sync");
    return false;
  }

  if (!user || !user.userId || !user.tenantId || !user.role) {
    console.error("Invalid user data for sync");
    return false;
  }

  const { userId, tenantId, role } = user;

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
      userId,
      tenantId,
      role,
    );
    const filteredOrganizations = filterDataByUserAndTenant(
      transformedOrganizations,
      userId,
      tenantId,
      role,
    );
    const filteredDeals = filterDataByUserAndTenant(
      transformedDeals,
      userId,
      tenantId,
      role,
    );
    const filteredUsers = filterDataByUserAndTenant(
      transformedUsers,
      userId,
      tenantId,
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

function filterDataByUserAndTenant(data, userId, tenantId, role) {
  if (!Array.isArray(data)) {
    return [];
  }

  if (role === "super_admin") {
    return data;
  }

  if (role === "admin") {
    return data.filter((item) => String(item.tenantId) === String(tenantId));
  }

  return data.filter(
    (item) =>
      String(item.tenantId) === String(tenantId) &&
      String(item.userId) === String(userId),
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
            API_ENDPOINTS.LEADS.UPDATE(data.leadId),
            data,
          );
        } else if (operation === "delete") {
          response = await apiClient.delete(
            API_ENDPOINTS.LEADS.DELETE(data.leadId),
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
            API_ENDPOINTS.DEALS.UPDATE(data._id),
            data,
          );
        } else if (operation === "delete") {
          response = await apiClient.delete(
            API_ENDPOINTS.DEALS.DELETE(data._id),
          );
        }
        break;

      case "users":
        if (operation === "create") {
          response = await apiClient.post(API_ENDPOINTS.USERS.CREATE, data);
        } else if (operation === "update") {
          response = await apiClient.put(
            API_ENDPOINTS.USERS.UPDATE(data.userId),
            data,
          );
        } else if (operation === "delete") {
          response = await apiClient.delete(
            API_ENDPOINTS.USERS.DELETE(data.userId),
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
    _id: org._id,
    organizationName: org.organizationName,
    organizationWebsite: org.organizationWebsite,
    organizationSize: org.organizationSize?.toString() || "",
    organizationIndustry: org.organizationIndustry,
    tenantId: org.tenantId,
    userId: org.userId,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
  };
}

function transformLeadFromBackend(lead) {
  return {
    _id: lead._id,
    leadName: `${lead.leadFirstName || ""} ${lead.leadLastName || ""}`.trim(),
    leadFirstName: lead.leadFirstName,
    leadLastName: lead.leadLastName,
    leadEmail: lead.leadEmail,
    leadSource: lead.leadSource,
    leadStatus: lead.leadStatus,
    leadScore: lead.leadScore,
    organizationId: lead.organizationId,
    tenantId: lead.tenantId,
    userId: lead.userId,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

function transformDealFromBackend(deal) {
  return {
    _id: deal._id,
    dealName: deal.dealName,
    dealValue: deal.dealValue,
    dealStatus: deal.dealStatus,
    dealStage: deal.dealStatus, // Using dealStatus as dealStage
    leadId: deal.leadId,
    organizationId: deal.organizationId,
    tenantId: deal.tenantId,
    userId: deal.userId,
    createdAt: deal.createdAt,
    updatedAt: deal.updatedAt,
  };
}

function transformUserFromBackend(user) {
  return {
    _id: user._id,
    userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    firstName: user.firstName,
    lastName: user.lastName,
    userEmail: user.userEmail,
    mobile: user.mobile,
    role: user.role,
    tenantId: user.tenantId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function transformToApiFormat(data, type) {
  if (type === "organization") {
    const apiData = {
      organizationName: data.organizationName,
    };

    if (data.organizationWebsite) {
      apiData.organizationWebsite = data.organizationWebsite;
    }
    if (data.organizationIndustry) {
      apiData.organizationIndustry = data.organizationIndustry;
    }
    if (data.organizationSize) {
      apiData.organizationSize = parseInt(data.organizationSize, 10);
    }

    return apiData;
  }

  return data;
}
