import { dbCreate } from "../init/dbInit.js";

let db = null;
let dbReady = false;

// Initialize database on worker startup
(async () => {
  db = await dbCreate();
  dbReady = true;
})();

function insertData(data, storeName) {
  if (!dbReady || !db) {
    postMessage({
      action: "insertError",
      error: "Database not ready",
    });
    return;
  }

  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  const request = store.add(data);

  request.onsuccess = () => {
    postMessage({ action: "insertSuccess" });
  };

  request.onerror = (e) => {
    postMessage({
      action: "insertError",
      error: e.target.error?.message,
    });
  };
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
    postMessage({ action: "getSuccess", data: request });
  };

  request.onerror = (e) => {
    postMessage({
      action: "getError",
      error: e.target.error?.message,
    });
  };
}

function getAllData(storeName) {
  if (!dbReady || !db) {
    postMessage({
      action: "getError",
      error: "Database not ready",
      storeName,
    });
    return;
  }

  const tx = db.transaction(storeName, "readonly");
  const store = tx.objectStore(storeName);
  const request = store.getAll();

  request.onsuccess = () => {
    console.log("All Data sent");
    postMessage({
      action: "getAllSuccess",
      leads: request.result,
      storeName,
    });
  };

  request.onerror = (e) => {
    postMessage({
      action: "getError",
      error: e.target.error?.message,
      storeName,
    });
  };
}

function putData(storeName, id, data) {
  if (!dbReady || !db) {
    postMessage({
      action: "updateError",
      error: "Database not ready",
    });
    return;
  }

  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  const request = store.put(data, id);

  request.onsuccess = () => {
    postMessage({ action: "putSuccess" });
  };

  request.onerror = (e) => {
    postMessage({
      action: "putError",
      error: e.target.error?.message,
    });
  };
}

self.onmessage = (e) => {
  switch (e.data.action) {
    case "initialize":
      // Database already initializes on worker startup
      if (dbReady && db) {
        postMessage({ action: "dbReady" });
      }
      break;

    case "createLead":
      insertData(e.data.leadData, "Leads");
      break;

    case "getAllLeads":
      console.log("Inside switch - getAllLeads, dbReady:", dbReady);
      getAllData("Leads");
      break;

    case "getLead":
      getDataById("Leads", e.data.id);
      break;
  }
};
