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

// UNCOMMENT TO USE IN NEW BROWSER TO ADD TEST USERS
// import { addTestUsers } from "../services/utils/addTestUsers.js";

let db = null;
let dbReady = false;

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

self.onmessage = (e) => {
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
      break;

    case "getAllLeads":
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
      break;

    case "getLead":
      getDataById("Leads", e.data.id, dbReady, db);
      break;

    case "getAllLeadsByUserId":
      console.log("Inside get data by user id: ", e.data.user_id);
      getLeadById(e.data.storeName, e.data.user_id, dbReady, db);
      break;

    case "getLeadById":
      getDataById(e.data.storeName, e.data.id, dbReady, db);
      break;

    case "deleteLead":
      // console.log(e.data.id);
      deleteData(e.data.id, "Leads", dbReady, db);
      break;

    case "updateLead":
      console.log("Inside update case");
      updateData("Leads", e.data.leadData, dbReady, db);
      break;

    // Organization cases:
    case "createOrganization":
      // console.log("Working on creating: ....");
      insertData(e.data.organizationData, "Organizations", dbReady, db);
      break;

    case "getAllOrganizations":
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
      break;

    case "getOrganizationById":
      getDataById("Organizations", e.data.id, dbReady, db);
      break;

    case "deleteOrganization":
      console.log(e.data.id);
      deleteData(e.data.id, "Organizations", dbReady, db);
      break;

    case "updateOrganization":
      console.log("Inside update organization case");
      updateData("Organizations", e.data.organizationData, dbReady, db);
      break;

    // Deal cases:
    case "createDeal":
      insertData(e.data.dealData, "Deals", dbReady, db);
      break;

    case "getAllDeals":
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
      break;

    case "getDeal":
      getDataById("Deals", e.data.id, dbReady, db);
      break;

    case "getDealById":
      getDataById("Deals", e.data.id, dbReady, db);
      break;

    case "deleteDeal":
      console.log(e.data.id);
      deleteData(e.data.id, "Deals", dbReady, db);
      break;

    case "updateDeal":
      console.log("Inside update deal case");
      updateData("Deals", e.data.dealData, dbReady, db);
      break;

    // Attachment cases:
    case "createAttachment":
      insertData(e.data.attachmentData, "Attachments", dbReady, db);
      break;

    case "getAllAttachments":
      getAllData("Attachments", dbReady, db);
      break;

    case "deleteAttachment":
      deleteData(e.data.id, "Attachments", dbReady, db);
      break;

    // Comment cases:
    case "getCommentById":
      console.log("Inside switch of comment");
      getDataById("Comments", e.data.id, dbReady, db);
      break;

    case "createComment":
      insertData(e.data.commentData, "Comments", dbReady, db);
      break;

    case "getAllComments":
      getAllData("Comments", dbReady, db);
      break;

    case "deleteComment":
      deleteData(e.data.id, "Comments", dbReady, db);
      break;

    // Calls cases:
    case "createCall":
      insertData(e.data.callData, "Calls", dbReady, db);
      break;

    case "getAllCalls":
      getAllData("Calls", dbReady, db);
      break;

    case "deleteCall":
      deleteData(e.data.id, "Calls", dbReady, db);
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
      break;

    case "deleteUser":
      console.log("Inside delete User case: ", e.data.id);
      deleteData(e.data.id, "Users", dbReady, db);
      break;

    case "createUser":
      insertData(e.data.userData, "Users", dbReady, db);
      break;

    // Tenant cases:
    case "createTenantWithAdmin":
      insertData(e.data.tenantData, "Tenants", dbReady, db);
      insertData(e.data.adminData, "Users", dbReady, db);
      postMessage({ action: "tenantCreated" });
      break;

    case "getAllTenants":
      getAllData("Tenants", dbReady, db);
      break;

    case "getTenantById":
      getDataById("Tenants", e.data.id, dbReady, db);
      break;

    case "updateTenant":
      updateData("Tenants", e.data.tenantData, dbReady, db);
      postMessage({ action: "tenantUpdated" });
      break;

    case "deleteTenant":
      deleteData(e.data.id, "Tenants", dbReady, db);
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
