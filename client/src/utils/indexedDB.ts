const DB_NAME = "campaignFluxDB";
const DB_VERSION = 1;

const OBJECT_STORES = [
  "users",
  "leads",
  "deals",
  "organizations",
  "tenants",
  "comments",
  "calls",
  "attachments",
];

export const initializeDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error(`Failed to open IndexedDB: ${request.error}`));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      OBJECT_STORES.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id" });
          console.log(`Created object store: ${storeName}`);
        }
      });
    };
  });
};

export const clearDatabase = async (): Promise<void> => {
  const db = await initializeDatabase();

  const transaction = db.transaction(OBJECT_STORES, "readwrite");

  for (const storeName of OBJECT_STORES) {
    const store = transaction.objectStore(storeName);
    await new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve(undefined);
      request.onerror = () => reject(request.error);
    });
  }

  db.close();
};

export const deleteDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);

    request.onsuccess = () => {
      console.log("Database deleted successfully");
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`Failed to delete database: ${request.error}`));
    };

    request.onblocked = () => {
      console.warn(
        "Database deletion blocked - close all tabs using this database",
      );
    };
  });
};

export { DB_NAME, DB_VERSION };
