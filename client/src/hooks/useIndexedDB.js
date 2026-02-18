import { useCallback, useEffect, useRef } from 'react';

const DB_NAME = 'CRM_Database';
const DB_VERSION = 1;

/**
 * IndexedDB Hook
 * Provides database operations for offline storage
 * 
 * @param {string} storeName - ObjectStore name
 * @returns {Object} Database operations
 */
export const useIndexedDB = (storeName) => {
  const dbRef = useRef(null);

  /**
   * Initialize database
   */
  const initDB = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (dbRef.current) {
        resolve(dbRef.current);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = (event) => {
        dbRef.current = event.target.result;
        resolve(dbRef.current);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores if they don't exist
        const stores = ['leads', 'users', 'deals', 'activities', 'sync_queue'];
        
        stores.forEach(store => {
          if (!db.objectStoreNames.contains(store)) {
            const objectStore = db.createObjectStore(store, { keyPath: 'id', autoIncrement: false });
            
            // Create indexes for common queries
            objectStore.createIndex('createdAt', 'createdAt', { unique: false });
            objectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
            
            if (store === 'leads') {
              objectStore.createIndex('status', 'status', { unique: false });
              objectStore.createIndex('source', 'source', { unique: false });
              objectStore.createIndex('stage', 'stage', { unique: false });
            }
            
            if (store === 'users') {
              objectStore.createIndex('role', 'role', { unique: false });
              objectStore.createIndex('email', 'email', { unique: false });
            }
            
            if (store === 'sync_queue') {
              objectStore.createIndex('timestamp', 'timestamp', { unique: false });
              objectStore.createIndex('operation', 'operation', { unique: false });
            }
          }
        });
      };
    });
  }, []);

  /**
   * Add item to store
   * @param {Object} item - Item to add
   */
  const addItem = useCallback(async (item) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [storeName, initDB]);

  /**
   * Get item by ID
   * @param {string} id - Item ID
   */
  const getItem = useCallback(async (id) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [storeName, initDB]);

  /**
   * Get all items
   */
  const getAll = useCallback(async () => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [storeName, initDB]);

  /**
   * Update item
   * @param {string} id - Item ID
   * @param {Object} updates - Updates to apply
   */
  const updateItem = useCallback(async (id, updates) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (!item) {
          reject(new Error(`Item with id ${id} not found`));
          return;
        }

        const updatedItem = { ...item, ...updates, updatedAt: new Date().toISOString() };
        const putRequest = store.put(updatedItem);

        putRequest.onsuccess = () => resolve(updatedItem);
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }, [storeName, initDB]);

  /**
   * Delete item
   * @param {string} id - Item ID
   */
  const deleteItem = useCallback(async (id) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }, [storeName, initDB]);

  /**
   * Clear all items from store
   */
  const clearStore = useCallback(async () => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }, [storeName, initDB]);

  /**
   * Query by index
   * @param {string} indexName - Index name
   * @param {*} value - Value to query
   */
  const queryByIndex = useCallback(async (indexName, value) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [storeName, initDB]);

  /**
   * Batch add items
   * @param {Array} items - Items to add
   */
  const batchAdd = useCallback(async (items) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      let completed = 0;
      const errors = [];

      items.forEach((item, index) => {
        const request = store.put(item);
        
        request.onsuccess = () => {
          completed++;
          if (completed === items.length) {
            resolve({ success: completed, errors });
          }
        };

        request.onerror = () => {
          errors.push({ index, error: request.error });
          completed++;
          if (completed === items.length) {
            resolve({ success: completed - errors.length, errors });
          }
        };
      });
    });
  }, [storeName, initDB]);

  /**
   * Batch delete items
   * @param {Array} ids - Item IDs to delete
   */
  const batchDelete = useCallback(async (ids) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      let completed = 0;
      const errors = [];

      ids.forEach((id, index) => {
        const request = store.delete(id);
        
        request.onsuccess = () => {
          completed++;
          if (completed === ids.length) {
            resolve({ success: completed, errors });
          }
        };

        request.onerror = () => {
          errors.push({ id, error: request.error });
          completed++;
          if (completed === ids.length) {
            resolve({ success: completed - errors.length, errors });
          }
        };
      });
    });
  }, [storeName, initDB]);

  // Initialize DB on mount
  useEffect(() => {
    initDB();
  }, [initDB]);

  return {
    addItem,
    getItem,
    getAll,
    updateItem,
    deleteItem,
    clearStore,
    queryByIndex,
    batchAdd,
    batchDelete,
  };
};
