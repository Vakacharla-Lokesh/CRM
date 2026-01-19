import { stores } from "../models/stores";

let db = null;
let dbReady = false;

export function dbCreate() {
  return new Promise((resolve, reject) => {
    if (dbReady) {
      postMessage({ action: "dbReady" });
      resolve(db);
      return;
    }

    const request = indexedDB.open("CRM_DB", 1);

    request.onerror = () => {
      console.error("IndexedDB open failed");
      reject(request.error);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;

      for (const store of Object.values(stores)) {
        if (!db.objectStoreNames.contains(store.name)) {
          db.createObjectStore(store.name, {
            keyPath: store.keyPath,
          });
        }
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      dbReady = true;
      postMessage({ action: "dbReady" });
      resolve(db);
    };
  });
}

function createStores() {
  for (let store of Object.entries(stores)) {
    db.createObjectStore(store[1].name, {
      keyPath: store[1].keyPath,
    });
    // console.log(store);
  }
}
