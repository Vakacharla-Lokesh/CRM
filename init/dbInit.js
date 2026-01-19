import { stores } from "../models/stores.js";

let db = null;
let dbReady = false;

export function dbCreate() {
  return new Promise((resolve, reject) => {
    if (dbReady && db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open("CRM_DB", 1);

    request.onerror = () => {
      console.error("IndexedDB open failed:", request.error);
      reject(request.error);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;

      // console.log("Database upgrade needed. Creating stores...");

      for (const [key, store] of Object.entries(stores)) {
        if (!db.objectStoreNames.contains(store.name)) {
          const objectStore = db.createObjectStore(store.name, {
            keyPath: store.keyPath,
          });
          // console.log(`Created store: ${store.name}`);
        }
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      dbReady = true;
      // console.log("Database opened successfully");
      resolve(db);
    };
  });
}
