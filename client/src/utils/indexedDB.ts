/**
 * Centralized IndexedDB Initialization
 * This ensures all object stores are created upfront
 */

const DB_NAME = "appDB";
const DB_VERSION = 2; // Increment version to trigger upgrade

// Define all object stores that should exist
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

/**
 * Initialize IndexedDB with all required object stores
 */
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

      // Create all object stores if they don't exist
      OBJECT_STORES.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id" });
          console.log(`Created object store: ${storeName}`);
        }
      });
    };
  });
};

/**
 * Clear all data from IndexedDB (useful for debugging)
 */
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

/**
 * Delete the entire database
 */
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
      console.warn("Database deletion blocked - close all tabs using this database");
    };
  });
};

export { DB_NAME, DB_VERSION };
