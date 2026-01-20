import { dbCreate } from "../init/dbInit.js";

let db = null;
let dbReady = false;

// Initialize database immediately
// console.log("Worker started, initializing database...");

async function initializeDb() {
  try {
    db = await dbCreate();
    dbReady = true;
    console.log("Worker: Database ready");
    self.postMessage({ action: "dbReady" });
  } catch (error) {
    console.error("Worker: Database initialization failed", error);
    postMessage({ action: "dbError", error: error.message });
  }
}

// Auto-initialize on worker load
initializeDb();

function insertData(data, storeName) {
  if (!dbReady || !db) {
    postMessage({
      action: "insertError",
      error: "Database not ready",
    });
    return;
  }

  try {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.add(data);

    request.onsuccess = () => {
      // console.log("Insert successful");
      postMessage({ action: "insertSuccess", data: data });
    };

    request.onerror = (e) => {
      console.error("Insert error:", e.target.error);
      postMessage({
        action: "insertError",
        error: e.target.error?.message || "Insert failed",
      });
    };
  } catch (error) {
    console.error("Transaction error:", error);
    postMessage({
      action: "insertError",
      error: error.message,
    });
  }
}

function getAllData(storeName) {
  // console.log("getAllData called for:", storeName, "dbReady:", dbReady);

  if (!dbReady || !db) {
    console.error("Database not ready");
    postMessage({
      action: "getAllError",
      error: "Database not ready",
      storeName,
    });
    return;
  }

  try {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      // console.log("getAllData success, count:", request.result.length);
      postMessage({
        action: "getAllSuccess",
        rows: request.result,
        storeName,
      });
    };

    request.onerror = (e) => {
      console.error("getAllData error:", e.target.error);
      postMessage({
        action: "getAllError",
        error: e.target.error?.message || "Fetch failed",
        storeName,
      });
    };
  } catch (error) {
    console.error("Transaction error:", error);
    postMessage({
      action: "getAllError",
      error: error.message,
      storeName,
    });
  }
}

function getDataById(storeName, id) {
  if (!dbReady || !db) {
    postMessage({
      action: "getError",
      error: "Database not ready",
    });
    return;
  }

  const tx = db.transaction(storeName, "readonly");
  const store = tx.objectStore(storeName);
  const request = store.get(id);

  request.onsuccess = () => {
    postMessage({ action: "getSuccess", data: request.result });
  };

  request.onerror = (e) => {
    postMessage({
      action: "getError",
      error: e.target.error?.message,
    });
  };
}

function updateData(storeName, data) {
  if (!dbReady || !db) {
    postMessage({
      action: "updateError",
      error: "Database not ready",
    });
    return;
  }

  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  const request = store.put(data);

  request.onsuccess = () => {
    postMessage({ action: "putSuccess", data: data });
  };

  request.onerror = (e) => {
    postMessage({
      action: "putError",
      error: e.target.error?.message,
    });
  };
}

self.onmessage = (e) => {
  // console.log("Worker received message:", e.data.action);

  switch (e.data.action) {
    case "initialize":
      if (dbReady && db) {
        postMessage({ action: "dbReady" });
      } else {
        initializeDb();
      }
      break;

    case "createLead":
      insertData(e.data.leadData, "Leads");
      break;

    case "getAllLeads":
      // console.log("Processing getAllLeads...");
      getAllData("Leads");
      break;

    case "getLead":
      getDataById("Leads", e.data.id);
      break;

    case "createOrganization":
      // console.log("Working on creating: ....");
      insertData(e.data.organizationData, "Organizations");
      break;

    case "getAllOrganizations":
      // console.log("Processing getAllLeads...");
      getAllData("Organizations");
      break;

    case "getOrganization":
      getDataById("Organizations", e.data.id);
      break;

    default:
      console.warn("Unknown action:", e.data.action);
  }
};
