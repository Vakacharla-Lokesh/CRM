import { useState, useEffect, useCallback } from 'react';
import { useIndexedDB } from './useIndexedDB';

/**
 * Offline Manager Hook
 * Manages offline queue and synchronization
 * 
 * @returns {Object} Offline operations and sync utilities
 */
export const useOfflineManager = () => {
  const [queue, setQueue] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const { addItem, getAll, deleteItem, clearStore } = useIndexedDB('sync_queue');

  /**
   * Listen for online/offline events
   */
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncQueue(); // Auto-sync when coming online
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Load queue from IndexedDB
   */
  const loadQueue = useCallback(async () => {
    try {
      const items = await getAll();
      setQueue(items || []);
      return items;
    } catch (error) {
      console.error('Failed to load sync queue:', error);
      return [];
    }
  }, [getAll]);

  /**
   * Add operation to queue
   * @param {Object} operation - Operation details
   */
  const addToQueue = useCallback(async (operation) => {
    const queueItem = {
      id: `queue_${Date.now()}_${Math.random()}`,
      timestamp: new Date().toISOString(),
      retries: 0,
      maxRetries: 3,
      ...operation,
    };

    try {
      await addItem(queueItem);
      setQueue(prev => [...prev, queueItem]);
      return queueItem;
    } catch (error) {
      console.error('Failed to add to queue:', error);
      throw error;
    }
  }, [addItem]);

  /**
   * Remove operation from queue
   * @param {string} id - Queue item ID
   */
  const removeFromQueue = useCallback(async (id) => {
    try {
      await deleteItem(id);
      setQueue(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to remove from queue:', error);
    }
  }, [deleteItem]);

  /**
   * Sync queue with server
   */
  const syncQueue = useCallback(async () => {
    if (!isOnline || syncing) {
      return;
    }

    setSyncing(true);

    try {
      const items = await loadQueue();
      
      if (!items || items.length === 0) {
        setSyncing(false);
        return;
      }

      console.log(`Syncing ${items.length} queued operations...`);

      for (const item of items) {
        try {
          // Execute the queued operation
          await executeQueuedOperation(item);
          
          // Remove from queue on success
          await removeFromQueue(item.id);
          
          console.log(`Synced operation: ${item.operation} - ${item.entity}`);
        } catch (error) {
          console.error(`Failed to sync operation ${item.id}:`, error);
          
          // Increment retry count
          item.retries++;
          
          // Remove if max retries exceeded
          if (item.retries >= item.maxRetries) {
            console.error(`Max retries exceeded for operation ${item.id}, removing from queue`);
            await removeFromQueue(item.id);
          }
        }
      }

      console.log('Queue sync completed');
    } catch (error) {
      console.error('Queue sync failed:', error);
    } finally {
      setSyncing(false);
    }
  }, [isOnline, syncing, loadQueue, removeFromQueue]);

  /**
   * Execute a queued operation
   * @param {Object} item - Queue item
   */
  const executeQueuedOperation = async (item) => {
    const { operation, entity, endpoint, data, method } = item;

    // Get auth token
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No auth token available');
    }

    const response = await fetch(endpoint, {
      method: method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: data ? JSON.stringify(data) : null,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  };

  /**
   * Clear entire queue
   */
  const clearQueue = useCallback(async () => {
    try {
      await clearStore();
      setQueue([]);
    } catch (error) {
      console.error('Failed to clear queue:', error);
    }
  }, [clearStore]);

  /**
   * Get queue statistics
   */
  const getQueueStats = useCallback(() => {
    return {
      total: queue.length,
      byOperation: queue.reduce((acc, item) => {
        acc[item.operation] = (acc[item.operation] || 0) + 1;
        return acc;
      }, {}),
      byEntity: queue.reduce((acc, item) => {
        acc[item.entity] = (acc[item.entity] || 0) + 1;
        return acc;
      }, {}),
    };
  }, [queue]);

  // Load queue on mount
  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  return {
    queue,
    queueStats: getQueueStats(),
    isOnline,
    syncing,
    addToQueue,
    removeFromQueue,
    syncQueue,
    clearQueue,
    loadQueue,
  };
};
