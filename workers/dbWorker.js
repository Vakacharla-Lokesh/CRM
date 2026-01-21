import { dbCreate } from "../init/dbInit.js";
import { deleteData } from "../services/deleteDb.js";
import { exportDb } from "../services/exportDb.js";
import { getCount } from "../services/getCount.js";
import { getAllData, getDataById } from "../services/getDb.js";
import { insertData } from "../services/insertDb.js";
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

    case "getOrganization":
      getDataById("Organizations", e.data.id, dbReady, db);
      break;

    case "getData":
      getCount(db);
      break;

    case "deleteLead":
      console.log(e.data.id);
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

    default:
      console.warn("Unknown action:", e.data.action);
  }
};

/**
 * Get a single record by ID and send response with the ID
 */
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
