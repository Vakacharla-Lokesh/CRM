import { dbCreate } from "../init/dbInit.js";
import { updateAllObjects } from "../services/calculateScore.js";
// import { generateLeadScores } from "../services/calculateScore.js";
import { deleteData } from "../services/deleteDb.js";
import { getCount } from "../services/getCount.js";
import { getDataByTenantAndUser } from "../services/getDataByTenant.js";
import { getAllData, getDataById } from "../services/getDb.js";
import { insertData } from "../services/insertDb.js";
import { convertLeadToDeal } from "../services/leadToDeal.js";
import { updateData } from "../services/updateDb.js";

let db = null;
let dbReady = false;

// console.log("Worker started, initializing database...");

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

    // case "getAllLeads":
    //   console.log("Processing getAllLeads...");
    //   getAllData("Leads", dbReady, db);
    //   break;
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

    // case "getAllOrganizations":
    //   // console.log("Processing getAllLeads...");
    //   getAllData("Organizations", dbReady, db);
    //   break;
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

    // case "getAllDeals":
    //   getAllData("Deals", dbReady, db);
    //   break;
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
      getCount(db, dbReady, e.data.tenant_id, e.data.user_id, e.data.role);
      break;

    // Lead score generation case:
    case "calculateScore":
      console.log("Inside calculate score switch case");
      updateAllObjects(db, dbReady);
      break;

    // Users case:
    // case "getAllUsers":
    //   console.log("Inside get Users switch case: ");
    //   getAllData("Users", dbReady, db);
    //   break;
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

    default:
      console.warn("Unknown action:", e.data.action);
  }
};
