import { stores } from "../models/stores.js";

let db = null;
let dbReady = false;

export function dbCreate() {
  return new Promise((resolve, reject) => {
    if (dbReady && db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open("CRM_DB", 2);

    request.onerror = () => {
      console.error("IndexedDB open failed:", request.error);
      reject(request.error);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;

      for (const store of Object.values(stores)) {
        let objectStore;

        if (!db.objectStoreNames.contains(store.name)) {
          objectStore = db.createObjectStore(store.name, {
            keyPath: store.keyPath,
          });
        } else {
          objectStore = event.target.transaction.objectStore(store.name);
        }

        if (store.indexes && store.indexes.length) {
          store.indexes.forEach((index) => {
            if (!objectStore.indexNames.contains(index.name)) {
              objectStore.createIndex(
                index.name,
                index.keyPath,
                index.options || { unique: false },
              );
            }
          });
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
