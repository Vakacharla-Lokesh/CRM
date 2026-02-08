// DB INITIALIZE
import { dbCreate } from "../services/init/dbInit.js";

// CRUD OPERATIONS IN DB
import { getAllData, getDataById } from "../services/database/getDb.js";
import { insertData } from "../services/database/insertDb.js";
import { updateData } from "../services/database/updateDb.js";
import { deleteData } from "../services/database/deleteDb.js";

import { updateAllObjects } from "../services/calculateScore.js";
import { getCount } from "../services/getCount.js";
import { getDataByTenantAndUser } from "../services/getDataByTenant.js";
import { convertLeadToDeal } from "../services/leadToDeal.js";

// API CLIENT
import { apiClient, API_ENDPOINTS } from "../services/api/apiClient.js";

// UNCOMMENT TO USE IN NEW BROWSER TO ADD TEST USERS
// import { addTestUsers } from "../services/utils/addTestUsers.js";

let db = null;
let dbReady = false;

// Helper function to sync API data to IndexedDB
async function syncToIndexedDB(storeName, data) {
  if (!dbReady || !db) return;
  
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  
  // Clear existing data and insert new data
  await store.clear();
  
  if (Array.isArray(data)) {
    for (const item of data) {
      await store.add(item);
    }
  } else {
    await store.add(data);
  }
  
  return tx.complete;
}

console.log("Worker started, initializing database...");

async function initialize() {
  try {
    db = await dbCreate();
    dbReady = true;
    // console.log("Worker: Database ready");
    // addTestUsers(db);
    self.postMessage({ action: "dbReady" });
  } catch (error) {
    console.error("Worker: Database initialization failed", error);
    postMessage({ action: "dbError", error: error.message });
  }
}

initialize();

self.onmessage = async (e) => {
  // console.log("Worker received message:", e.data.action);

  switch (e.data.action) {
    case "initialize":
      // console.log("db worker working")
      if (dbReady && db) {
        postMessage({ action: "dbReady" });
      } else {
        initialize();
      }
      break;

    // Lead cases:
    case "createLead":
      insertData(e.data.leadData, "Leads", dbReady, db);
      // Also create on API
      try {
        await apiClient.post(API_ENDPOINTS.LEADS.CREATE, e.data.leadData);
      } catch (error) {
        console.error("Failed to create lead on API:", error);
      }
      break;

    case "getAllLeads":
      try {
        // Fetch from API
        const leadsResponse = await apiClient.get(API_ENDPOINTS.LEADS.GET_ALL);
        const leadsData = leadsResponse.data || leadsResponse;
        
        // Sync to IndexedDB
        await syncToIndexedDB("Leads", leadsData);
        
        // Filter by tenant and user if needed
        let filteredLeads = leadsData;
        if (e.data.tenant_id && e.data.user_id && e.data.role) {
          if (e.data.role === "admin") {
            filteredLeads = leadsData.filter(
              (lead) => String(lead.tenant_id) === String(e.data.tenant_id)
            );
          } else {
            filteredLeads = leadsData.filter(
              (lead) =>
                String(lead.tenant_id) === String(e.data.tenant_id) &&
                String(lead.user_id) === String(e.data.user_id)
            );
          }
        }
        
        postMessage({
          action: "dataFetched",
          storeName: "Leads",
          rows: filteredLeads,
        });
      } catch (error) {
        console.error("Failed to fetch leads from API:", error);
        // Fallback to IndexedDB
        if (e.data.tenant_id && e.data.user_id && e.data.role) {
          getDataByTenantAndUser(
            "Leads",
            e.data.user_id,
            e.data.tenant_id,
            e.data.role,
            dbReady,
            db,
          );
        } else {
          getAllData("Leads", dbReady, db);
        }
      }
      break;

    case "getLead":
      try {
        const leadResponse = await apiClient.get(API_ENDPOINTS.LEADS.GET_BY_ID(e.data.id));
        const leadData = leadResponse.data || leadResponse;
        postMessage({
          action: "dataFetched",
          storeName: "Leads",
          data: leadData,
        });
      } catch (error) {
        console.error("Failed to fetch lead from API:", error);
        getDataById("Leads", e.data.id, dbReady, db);
      }
      break;

    case "getAllLeadsByUserId":
      console.log("Inside get data by user id: ", e.data.user_id);
      try {
        const userLeadsResponse = await apiClient.get(API_ENDPOINTS.LEADS.BY_USER(e.data.user_id));
        const userLeadsData = userLeadsResponse.data || userLeadsResponse;
        postMessage({
          action: "dataFetched",
          storeName: e.data.storeName,
          rows: userLeadsData,
        });
      } catch (error) {
        console.error("Failed to fetch user leads from API:", error);
        getLeadById(e.data.storeName, e.data.user_id, dbReady, db);
      }
      break;

    case "getLeadById":
      try {
        const specificLeadResponse = await apiClient.get(API_ENDPOINTS.LEADS.GET_BY_ID(e.data.id));
        const specificLeadData = specificLeadResponse.data || specificLeadResponse;
        postMessage({
          action: "dataFetched",
          storeName: e.data.storeName,
          data: specificLeadData,
        });
      } catch (error) {
        console.error("Failed to fetch specific lead from API:", error);
        getDataById(e.data.storeName, e.data.id, dbReady, db);
      }
      break;

    case "deleteLead":
      try {
        await apiClient.delete(API_ENDPOINTS.LEADS.DELETE(e.data.id));
        deleteData(e.data.id, "Leads", dbReady, db);
      } catch (error) {
        console.error("Failed to delete lead from API:", error);
        deleteData(e.data.id, "Leads", dbReady, db);
      }
      break;

    case "updateLead":
      console.log("Inside update case");
      try {
        await apiClient.put(API_ENDPOINTS.LEADS.UPDATE(e.data.leadData.lead_id), e.data.leadData);
        updateData("Leads", e.data.leadData, dbReady, db);
      } catch (error) {
        console.error("Failed to update lead on API:", error);
        updateData("Leads", e.data.leadData, dbReady, db);
      }
      break;

    // Organization cases:
    case "createOrganization":
      insertData(e.data.organizationData, "Organizations", dbReady, db);
      try {
        await apiClient.post(API_ENDPOINTS.ORGANIZATIONS.CREATE, e.data.organizationData);
      } catch (error) {
        console.error("Failed to create organization on API:", error);
      }
      break;

    case "getAllOrganizations":
      try {
        const orgsResponse = await apiClient.get(API_ENDPOINTS.ORGANIZATIONS.GET_ALL);
        const orgsData = orgsResponse.data || orgsResponse;
        
        await syncToIndexedDB("Organizations", orgsData);
        
        let filteredOrgs = orgsData;
        if (e.data.tenant_id && e.data.user_id && e.data.role) {
          if (e.data.role === "admin") {
            filteredOrgs = orgsData.filter(
              (org) => String(org.tenant_id) === String(e.data.tenant_id)
            );
          } else {
            filteredOrgs = orgsData.filter(
              (org) =>
                String(org.tenant_id) === String(e.data.tenant_id) &&
                String(org.user_id) === String(e.data.user_id)
            );
          }
        }
        
        postMessage({
          action: "dataFetched",
          storeName: "Organizations",
          rows: filteredOrgs,
        });
      } catch (error) {
        console.error("Failed to fetch organizations from API:", error);
        if (e.data.tenant_id && e.data.user_id && e.data.role) {
          getDataByTenantAndUser(
            "Organizations",
            e.data.user_id,
            e.data.tenant_id,
            e.data.role,
            dbReady,
            db,
          );
        } else {
          getAllData("Organizations", dbReady, db);
        }
      }
      break;

    case "getOrganizationById":
      try {
        const orgResponse = await apiClient.get(API_ENDPOINTS.ORGANIZATIONS.GET_BY_ID(e.data.id));
        const orgData = orgResponse.data || orgResponse;
        postMessage({
          action: "dataFetched",
          storeName: "Organizations",
          data: orgData,
        });
      } catch (error) {
        console.error("Failed to fetch organization from API:", error);
        getDataById("Organizations", e.data.id, dbReady, db);
      }
      break;

    case "deleteOrganization":
      console.log(e.data.id);
      try {
        await apiClient.delete(API_ENDPOINTS.ORGANIZATIONS.DELETE(e.data.id));
        deleteData(e.data.id, "Organizations", dbReady, db);
      } catch (error) {
        console.error("Failed to delete organization from API:", error);
        deleteData(e.data.id, "Organizations", dbReady, db);
      }
      break;

    case "updateOrganization":
      console.log("Inside update organization case");
      try {
        await apiClient.put(
          API_ENDPOINTS.ORGANIZATIONS.UPDATE(e.data.organizationData.organization_id),
          e.data.organizationData
        );
        updateData("Organizations", e.data.organizationData, dbReady, db);
      } catch (error) {
        console.error("Failed to update organization on API:", error);
        updateData("Organizations", e.data.organizationData, dbReady, db);
      }
      break;

    // Deal cases:
    case "createDeal":
      insertData(e.data.dealData, "Deals", dbReady, db);
      try {
        await apiClient.post(API_ENDPOINTS.DEALS.CREATE, e.data.dealData);
      } catch (error) {
        console.error("Failed to create deal on API:", error);
      }
      break;

    case "getAllDeals":
      try {
        const dealsResponse = await apiClient.get(API_ENDPOINTS.DEALS.GET_ALL);
        const dealsData = dealsResponse.data || dealsResponse;
        
        await syncToIndexedDB("Deals", dealsData);
        
        let filteredDeals = dealsData;
        if (e.data.tenant_id && e.data.user_id && e.data.role) {
          if (e.data.role === "admin") {
            filteredDeals = dealsData.filter(
              (deal) => String(deal.tenant_id) === String(e.data.tenant_id)
            );
          } else {
            filteredDeals = dealsData.filter(
              (deal) =>
                String(deal.tenant_id) === String(e.data.tenant_id) &&
                String(deal.user_id) === String(e.data.user_id)
            );
          }
        }
        
        postMessage({
          action: "dataFetched",
          storeName: "Deals",
          rows: filteredDeals,
        });
      } catch (error) {
        console.error("Failed to fetch deals from API:", error);
        if (e.data.tenant_id && e.data.user_id && e.data.role) {
          getDataByTenantAndUser(
            "Deals",
            e.data.user_id,
            e.data.tenant_id,
            e.data.role,
            dbReady,
            db,
          );
        } else {
          getAllData("Deals", dbReady, db);
        }
      }
      break;

    case "getDeal":
      try {
        const dealResponse = await apiClient.get(API_ENDPOINTS.DEALS.GET_BY_ID(e.data.id));
        const dealData = dealResponse.data || dealResponse;
        postMessage({
          action: "dataFetched",
          storeName: "Deals",
          data: dealData,
        });
      } catch (error) {
        console.error("Failed to fetch deal from API:", error);
        getDataById("Deals", e.data.id, dbReady, db);
      }
      break;

    case "getDealById":
      try {
        const specificDealResponse = await apiClient.get(API_ENDPOINTS.DEALS.GET_BY_ID(e.data.id));
        const specificDealData = specificDealResponse.data || specificDealResponse;
        postMessage({
          action: "dataFetched",
          storeName: "Deals",
          data: specificDealData,
        });
      } catch (error) {
        console.error("Failed to fetch specific deal from API:", error);
        getDataById("Deals", e.data.id, dbReady, db);
      }
      break;

    case "deleteDeal":
      console.log(e.data.id);
      try {
        await apiClient.delete(API_ENDPOINTS.DEALS.DELETE(e.data.id));
        deleteData(e.data.id, "Deals", dbReady, db);
      } catch (error) {
        console.error("Failed to delete deal from API:", error);
        deleteData(e.data.id, "Deals", dbReady, db);
      }
      break;

    case "updateDeal":
      console.log("Inside update deal case");
      try {
        await apiClient.put(API_ENDPOINTS.DEALS.UPDATE(e.data.dealData.deal_id), e.data.dealData);
        updateData("Deals", e.data.dealData, dbReady, db);
      } catch (error) {
        console.error("Failed to update deal on API:", error);
        updateData("Deals", e.data.dealData, dbReady, db);
      }
      break;

    // Attachment cases:
    case "createAttachment":
      insertData(e.data.attachmentData, "Attachments", dbReady, db);
      try {
        await apiClient.post(API_ENDPOINTS.ATTACHMENTS.CREATE, e.data.attachmentData);
      } catch (error) {
        console.error("Failed to create attachment on API:", error);
      }
      break;

    case "getAllAttachments":
      try {
        const attachmentsResponse = await apiClient.get(API_ENDPOINTS.ATTACHMENTS.GET_ALL);
        const attachmentsData = attachmentsResponse.data || attachmentsResponse;
        
        await syncToIndexedDB("Attachments", attachmentsData);
        
        postMessage({
          action: "dataFetched",
          storeName: "Attachments",
          rows: attachmentsData,
        });
      } catch (error) {
        console.error("Failed to fetch attachments from API:", error);
        getAllData("Attachments", dbReady, db);
      }
      break;

    case "deleteAttachment":
      try {
        await apiClient.delete(API_ENDPOINTS.ATTACHMENTS.DELETE(e.data.id));
        deleteData(e.data.id, "Attachments", dbReady, db);
      } catch (error) {
        console.error("Failed to delete attachment from API:", error);
        deleteData(e.data.id, "Attachments", dbReady, db);
      }
      break;

    // Comment cases:
    case "getCommentById":
      console.log("Inside switch of comment");
      try {
        const commentResponse = await apiClient.get(API_ENDPOINTS.COMMENTS.GET_BY_ID(e.data.id));
        const commentData = commentResponse.data || commentResponse;
        postMessage({
          action: "dataFetched",
          storeName: "Comments",
          data: commentData,
        });
      } catch (error) {
        console.error("Failed to fetch comment from API:", error);
        getDataById("Comments", e.data.id, dbReady, db);
      }
      break;

    case "createComment":
      insertData(e.data.commentData, "Comments", dbReady, db);
      try {
        await apiClient.post(API_ENDPOINTS.COMMENTS.CREATE, e.data.commentData);
      } catch (error) {
        console.error("Failed to create comment on API:", error);
      }
      break;

    case "getAllComments":
      try {
        const commentsResponse = await apiClient.get(API_ENDPOINTS.COMMENTS.GET_ALL);
        const commentsData = commentsResponse.data || commentsResponse;
        
        await syncToIndexedDB("Comments", commentsData);
        
        postMessage({
          action: "dataFetched",
          storeName: "Comments",
          rows: commentsData,
        });
      } catch (error) {
        console.error("Failed to fetch comments from API:", error);
        getAllData("Comments", dbReady, db);
      }
      break;

    case "deleteComment":
      try {
        await apiClient.delete(API_ENDPOINTS.COMMENTS.DELETE(e.data.id));
        deleteData(e.data.id, "Comments", dbReady, db);
      } catch (error) {
        console.error("Failed to delete comment from API:", error);
        deleteData(e.data.id, "Comments", dbReady, db);
      }
      break;

    // Calls cases:
    case "createCall":
      insertData(e.data.callData, "Calls", dbReady, db);
      try {
        await apiClient.post(API_ENDPOINTS.CALLS.CREATE, e.data.callData);
      } catch (error) {
        console.error("Failed to create call on API:", error);
      }
      break;

    case "getAllCalls":
      try {
        const callsResponse = await apiClient.get(API_ENDPOINTS.CALLS.GET_ALL);
        const callsData = callsResponse.data || callsResponse;
        
        await syncToIndexedDB("Calls", callsData);
        
        postMessage({
          action: "dataFetched",
          storeName: "Calls",
          rows: callsData,
        });
      } catch (error) {
        console.error("Failed to fetch calls from API:", error);
        getAllData("Calls", dbReady, db);
      }
      break;

    case "deleteCall":
      try {
        await apiClient.delete(API_ENDPOINTS.CALLS.DELETE(e.data.id));
        deleteData(e.data.id, "Calls", dbReady, db);
      } catch (error) {
        console.error("Failed to delete call from API:", error);
        deleteData(e.data.id, "Calls", dbReady, db);
      }
      break;

    // Lead to deal case:
    case "convertToDeal":
      convertLeadToDeal(e.data.lead_id, dbReady, db);
      break;

    // Home data extraction case:
    case "getData":
      getCount(
        db,
        dbReady,
        e.data.tenant_id,
        e.data.user_id,
        e.data.role,
        e.data,
      );
      break;

    // Lead score generation case:
    case "calculateScore":
      console.log("Inside calculate score switch case");
      updateAllObjects(
        db,
        dbReady,
        e.data.user_id,
        e.data.tenant_id,
        e.data.role,
      );
      break;

    // User cases:
    case "getAllUsers":
      try {
        const usersResponse = await apiClient.get(API_ENDPOINTS.USERS.GET_ALL);
        const usersData = usersResponse.data || usersResponse;
        
        await syncToIndexedDB("Users", usersData);
        
        let filteredUsers = usersData;
        if (e.data.tenant_id && e.data.role) {
          filteredUsers = usersData.filter(
            (user) => String(user.tenant_id) === String(e.data.tenant_id)
          );
        }
        
        postMessage({
          action: "dataFetched",
          storeName: "Users",
          rows: filteredUsers,
        });
      } catch (error) {
        console.error("Failed to fetch users from API:", error);
        if (e.data.tenant_id && e.data.role) {
          getDataByTenantAndUser(
            "Users",
            null,
            e.data.tenant_id,
            e.data.role,
            dbReady,
            db,
          );
        } else {
          getAllData("Users", dbReady, db);
        }
      }
      break;

    case "deleteUser":
      console.log("Inside delete User case: ", e.data.id);
      try {
        await apiClient.delete(API_ENDPOINTS.USERS.DELETE(e.data.id));
        deleteData(e.data.id, "Users", dbReady, db);
      } catch (error) {
        console.error("Failed to delete user from API:", error);
        deleteData(e.data.id, "Users", dbReady, db);
      }
      break;

    case "createUser":
      insertData(e.data.userData, "Users", dbReady, db);
      try {
        await apiClient.post(API_ENDPOINTS.USERS.CREATE, e.data.userData);
      } catch (error) {
        console.error("Failed to create user on API:", error);
      }
      break;

    // Tenant cases:
    case "createTenantWithAdmin":
      insertData(e.data.tenantData, "Tenants", dbReady, db);
      insertData(e.data.adminData, "Users", dbReady, db);
      try {
        await apiClient.post(API_ENDPOINTS.TENANTS.CREATE, {
          ...e.data.tenantData,
          admin: e.data.adminData,
        });
      } catch (error) {
        console.error("Failed to create tenant on API:", error);
      }
      postMessage({ action: "tenantCreated" });
      break;

    case "getAllTenants":
      try {
        const tenantsResponse = await apiClient.get(API_ENDPOINTS.TENANTS.GET_ALL);
        const tenantsData = tenantsResponse.data || tenantsResponse;
        
        await syncToIndexedDB("Tenants", tenantsData);
        
        postMessage({
          action: "dataFetched",
          storeName: "Tenants",
          rows: tenantsData,
        });
      } catch (error) {
        console.error("Failed to fetch tenants from API:", error);
        getAllData("Tenants", dbReady, db);
      }
      break;

    case "getTenantById":
      try {
        const tenantResponse = await apiClient.get(API_ENDPOINTS.TENANTS.GET_BY_ID(e.data.id));
        const tenantData = tenantResponse.data || tenantResponse;
        postMessage({
          action: "dataFetched",
          storeName: "Tenants",
          data: tenantData,
        });
      } catch (error) {
        console.error("Failed to fetch tenant from API:", error);
        getDataById("Tenants", e.data.id, dbReady, db);
      }
      break;

    case "updateTenant":
      try {
        await apiClient.put(API_ENDPOINTS.TENANTS.UPDATE(e.data.tenantData.tenant_id), e.data.tenantData);
        updateData("Tenants", e.data.tenantData, dbReady, db);
      } catch (error) {
        console.error("Failed to update tenant on API:", error);
        updateData("Tenants", e.data.tenantData, dbReady, db);
      }
      postMessage({ action: "tenantUpdated" });
      break;

    case "deleteTenant":
      try {
        await apiClient.delete(API_ENDPOINTS.TENANTS.DELETE(e.data.id));
        deleteData(e.data.id, "Tenants", dbReady, db);
      } catch (error) {
        console.error("Failed to delete tenant from API:", error);
        deleteData(e.data.id, "Tenants", dbReady, db);
      }
      postMessage({ action: "tenantDeleted" });
      break;

    // export case:
    case "exportData":
      if (!dbReady || !db) return;

      const { storeName, user_id, tenant_id, role } = e.data;

      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        let data = request.result;
        if (role === "admin") {
          data = data.filter(
            (item) => String(item.tenant_id) === String(tenant_id),
          );
        } else {
          data = data.filter(
            (item) =>
              String(item.tenant_id) === String(tenant_id) &&
              String(item.user_id) === String(user_id),
          );
        }

        postMessage({
          action: "exportDataReady",
          storeName,
          data,
        });
      };

      request.onerror = () => {
        postMessage({
          action: "exportDataError",
          error: request.error?.message || "Export failed",
        });
      };

      break;

    default:
      console.warn("Unknown action:", e.data.action);
  }
};
