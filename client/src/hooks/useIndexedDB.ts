import { useState, useCallback } from "react";
import { initializeDatabase, DB_NAME, DB_VERSION } from "../utils/indexedDB";

interface IndexedDBHookResult<T> {
  addItem: (item: T) => Promise<IDBValidKey>;
  updateItem: (id: string, item: T) => Promise<IDBValidKey>;
  deleteItem: (id: string) => Promise<void>;
  getItem: (id: string) => Promise<T | undefined>;
  getAll: () => Promise<T[]>;
  clear: () => Promise<void>;
  getAllByIndex: (indexName: string, key: unknown) => Promise<T[]>;
}

/**
 * IndexedDB Hook
 * Provides a simple interface for IndexedDB operations
 *
 * @param storeName - Name of the object store
 * @param dbName - Name of the database (default: 'appDB')
 * @param version - Database version (default: 2)
 * @returns IndexedDB operations
 */
export const useIndexedDB = <T extends { id: string }>(
  storeName: string,
  dbName = DB_NAME,
  version = DB_VERSION,
): IndexedDBHookResult<T> => {
  const [, setIsInitialized] = useState(false);

  /**
   * Initialize database connection
   */
  const initDB = useCallback(async (): Promise<IDBDatabase> => {
    const db = await initializeDatabase();
    setIsInitialized(true);
    return db;
  }, []);

  /**
   * Add item to store
   */
  const addItem = useCallback(
    async (item: T): Promise<IDBValidKey> => {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        // Check if store exists
        if (!db.objectStoreNames.contains(storeName)) {
          reject(new Error(`Object store "${storeName}" does not exist. Database may need to be reinitialized.`));
          return;
        }
        
        const transaction = db.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.add(item);

        request.onerror = () => {
          reject(new Error(`Failed to add item: ${request.error}`));
        };

        request.onsuccess = () => {
          resolve(request.result);
        };
      });
    },
    [initDB, storeName],
  );

  /**
   * Update item in store
   */
  const updateItem = useCallback(
    async (id: string, item: T): Promise<IDBValidKey> => {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.put({ ...item, id });

        request.onerror = () => {
          reject(new Error(`Failed to update item: ${request.error}`));
        };

        request.onsuccess = () => {
          resolve(request.result);
        };
      });
    },
    [initDB, storeName],
  );

  /**
   * Delete item from store
   */
  const deleteItem = useCallback(
    async (id: string): Promise<void> => {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onerror = () => {
          reject(new Error(`Failed to delete item: ${request.error}`));
        };

        request.onsuccess = () => {
          resolve();
        };
      });
    },
    [initDB, storeName],
  );

  /**
   * Get item from store
   */
  const getItem = useCallback(
    async (id: string): Promise<T | undefined> => {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.get(id);

        request.onerror = () => {
          reject(new Error(`Failed to get item: ${request.error}`));
        };

        request.onsuccess = () => {
          resolve(request.result as T | undefined);
        };
      });
    },
    [initDB, storeName],
  );

  /**
   * Get all items from store
   */
  const getAll = useCallback(async (): Promise<T[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => {
        reject(new Error(`Failed to get all items: ${request.error}`));
      };

      request.onsuccess = () => {
        resolve(request.result as T[]);
      };
    });
  }, [initDB, storeName]);

  /**
   * Clear store
   */
  const clear = useCallback(async (): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => {
        reject(new Error(`Failed to clear store: ${request.error}`));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }, [initDB, storeName]);

  /**
   * Get all items by index
   */
  const getAllByIndex = useCallback(
    async (indexName: string, key: unknown): Promise<T[]> => {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);

        if (!store.indexNames.contains(indexName)) {
          reject(
            new Error(
              `Index ${indexName} does not exist in store ${storeName}`,
            ),
          );
          return;
        }

        const index = store.index(indexName);
        const request = index.getAll(key as IDBValidKey | IDBKeyRange);

        request.onerror = () => {
          reject(new Error(`Failed to get items by index: ${request.error}`));
        };

        request.onsuccess = () => {
          resolve(request.result as T[]);
        };
      });
    },
    [initDB, storeName],
  );

  return {
    addItem,
    updateItem,
    deleteItem,
    getItem,
    getAll,
    clear,
    getAllByIndex,
  };
};
