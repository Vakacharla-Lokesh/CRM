import { dbCreate } from "../init/dbInit.js";
import { updateAllObjects } from "../services/calculateScore.js";
// import { generateLeadScores } from "../services/calculateScore.js";
import { deleteData } from "../services/deleteDb.js";
import { getCount } from "../services/getCount.js";
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

    case "createLead":
      insertData(e.data.leadData, "Leads", dbReady, db);
      break;

    case "getAllLeads":
      // console.log("Processing getAllLeads...");
      getAllData("Leads", dbReady, db);
      break;

    case "getLead":
      getDataById("Leads", e.data.id, dbReady, db);
      break;

    case "getLeadById":
      getLeadById(e.data.storeName, e.data.id, dbReady, db);
      break;

    case "createOrganization":
      // console.log("Working on creating: ....");
      insertData(e.data.organizationData, "Organizations", dbReady, db);
      break;

    case "getAllOrganizations":
      // console.log("Processing getAllLeads...");
      getAllData("Organizations", dbReady, db);
      break;

    case "getOrganizationById":
      getDataById("Organizations", e.data.id, dbReady, db);
      break;

    case "getData":
      getCount(db, dbReady);
      break;

    case "deleteLead":
      // console.log(e.data.id);
      deleteData(e.data.id, "Leads", dbReady, db);
      break;

    case "deleteOrganization":
      console.log(e.data.id);
      deleteData(e.data.id, "Organizations", dbReady, db);
      break;

    case "getCommentById":
      console.log("Inside switch of comment");
      getDataById("Comments", e.data.id, dbReady, db);
      break;

    case "createDeal":
      insertData(e.data.dealData, "Deals", dbReady, db);
      break;

    case "getAllDeals":
      getAllData("Deals", dbReady, db);
      break;

    case "getDeal":
      getDataById("Deals", e.data.id, dbReady, db);
      break;

    case "getDealById":
      getLeadById(e.data.storeName, e.data.id, dbReady, db);
      break;

    case "deleteDeal":
      console.log(e.data.id);
      deleteData(e.data.id, "Deals", dbReady, db);
      break;

    case "calculateScore":
      console.log("Inside calculate score switch case: ");
      // generateLeadScores(db, dbReady);
      updateAllObjects();
      break;

    case "updateLead":
      console.log("Inside update case");
      updateData("Leads", e.data.leadData, dbReady, db);
      break;

    case "createAttachment":
      insertData(e.data.attachmentData, "Attachments", dbReady, db);
      break;

    case "getAllAttachments":
      getAllData("Attachments", dbReady, db);
      break;

    case "deleteAttachment":
      deleteData(e.data.id, "Attachments", dbReady, db);
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

    case "createCall":
      insertData(e.data.callData, "Calls", dbReady, db);
      break;

    case "getAllCalls":
      getAllData("Calls", dbReady, db);
      break;

    case "deleteCall":
      deleteData(e.data.id, "Calls", dbReady, db);
      break;

    case "convertToDeal":
      convertLeadToDeal(e.data.lead_id, dbReady, db);
      break;

    default:
      console.warn("Unknown action:", e.data.action);
  }
};

function getLeadById(storeName, id, dbReady, db) {
  if (!dbReady || !db) {
    postMessage({
      action: "getByIdError",
      error: "Database not ready",
      id,
    });
    return;
  }

  try {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => {
      postMessage({
        action: "getByIdSuccess",
        data: request.result,
        id,
      });
    };

    request.onerror = (e) => {
      postMessage({
        action: "getByIdError",
        error: e.target.error?.message,
        id,
      });
    };
  } catch (error) {
    postMessage({
      action: "getByIdError",
      error: error.message,
      id,
    });
  }
}
