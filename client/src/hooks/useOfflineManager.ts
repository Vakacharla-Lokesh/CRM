import { useState, useEffect, useCallback, useRef } from "react";
import { processBatches } from "../offline/batchProcessor";
import type {
  OfflineRequest,
  QueueStats,
  SyncResult,
} from "@/types/interfaces/offlineInterfaces";

export const useOfflineManager = () => {
  const [queue, setQueue] = useState<OfflineRequest[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [isOfflineModeEnabled, setIsOfflineModeEnabled] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const queueRef = useRef<Map<string, OfflineRequest>>(new Map());
  const isSyncInProgress = useRef(false);

  // IndexedDB helper functions
  const openDB = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("CRM_OfflineDB", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("offlineQueue")) {
          db.createObjectStore("offlineQueue", { keyPath: "id" });
        }
      };
    });
  }, []);

  const saveToIndexedDB = useCallback(
    async (request: OfflineRequest) => {
      try {
        const db = await openDB();
        const tx = db.transaction("offlineQueue", "readwrite");
        const store = tx.objectStore("offlineQueue");
        await store.put(request);
      } catch (error) {
        console.error("Failed to save to IndexedDB:", error);
      }
    },
    [openDB],
  );

  const removeFromIndexedDB = useCallback(
    async (requestId: string) => {
      try {
        const db = await openDB();
        const tx = db.transaction("offlineQueue", "readwrite");
        const store = tx.objectStore("offlineQueue");
        await store.delete(requestId);
      } catch (error) {
        console.error("Failed to remove from IndexedDB:", error);
      }
    },
    [openDB],
  );

  const clearIndexedDB = useCallback(async () => {
    try {
      const db = await openDB();
      const tx = db.transaction("offlineQueue", "readwrite");
      const store = tx.objectStore("offlineQueue");
      await store.clear();
    } catch (error) {
      console.error("Failed to clear IndexedDB:", error);
    }
  }, [openDB]);

  useEffect(() => {
    const loadQueue = async () => {
      try {
        const db = await openDB();
        const tx = db.transaction("offlineQueue", "readonly");
        const store = tx.objectStore("offlineQueue");
        const allRequests = await getAllFromStore(store);

        allRequests.forEach((req: OfflineRequest) => {
          queueRef.current.set(req.id, req);
        });

        setQueue(Array.from(queueRef.current.values()));
      } catch (error) {
        console.error("Failed to load queue from IndexedDB:", error);
      }
    };

    const getAllFromStore = (
      store: IDBObjectStore,
    ): Promise<OfflineRequest[]> => {
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    };

    loadQueue();
  }, [openDB]);

  const addToQueue = useCallback(
    (
      url: string,
      method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" = "POST",
      body?: unknown,
      headers?: Record<string, string>,
      maxRetries = 3,
      entityType: OfflineRequest["entityType"] = "leads",
      operationType: OfflineRequest["operationType"] = "create",
    ): string => {
      if (!isOfflineModeEnabled && isOnline) {
        return "";
      }

      const idempotencyKey = crypto.randomUUID();
      const request: OfflineRequest = {
        id: `${method}-${url}-${Date.now()}-${Math.random()}`,
        url,
        method,
        headers,
        body,
        timestamp: Date.now(),
        retries: 0,
        maxRetries,
        idempotencyKey,
        entityType,
        operationType,
      };

      queueRef.current.set(request.id, request);
      setQueue(Array.from(queueRef.current.values()));
      saveToIndexedDB(request);

      return idempotencyKey;
    },
    [isOfflineModeEnabled, isOnline, saveToIndexedDB],
  );

  const removeFromQueue = useCallback(
    (requestId: string) => {
      queueRef.current.delete(requestId);
      setQueue(Array.from(queueRef.current.values()));
      removeFromIndexedDB(requestId);
    },
    [removeFromIndexedDB],
  );

  const retryRequest = useCallback(
    (requestId: string) => {
      const request = queueRef.current.get(requestId);
      if (request) {
        request.retries += 1;
        queueRef.current.set(requestId, request);
        setQueue(Array.from(queueRef.current.values()));
        saveToIndexedDB(request);
      }
    },
    [saveToIndexedDB],
  );

  const clearQueue = useCallback(() => {
    queueRef.current.clear();
    setQueue([]);
    clearIndexedDB();
  }, [clearIndexedDB]);

  const syncQueue = useCallback(async (): Promise<SyncResult> => {
    if (!isOnline || isSyncInProgress.current || queue.length === 0) {
      return { succeeded: 0, failed: 0, errors: [] };
    }

    isSyncInProgress.current = true;
    setIsSyncing(true);

    const result: SyncResult = {
      succeeded: 0,
      failed: 0,
      errors: [],
    };

    try {
      const batchResult = await processBatches(queue);
      const processedCount = batchResult.processedCount;

      const processedRequests = queue.slice(0, processedCount);
      processedRequests.forEach((req) => {
        removeFromQueue(req.id);
      });

      result.succeeded = processedCount;

      if (batchResult.failedBatchIndex !== null) {
        result.failed = queue.length - processedCount;
        result.errors.push({
          entityType: queue[processedCount]?.entityType || "unknown",
          error: "Batch permanently failed",
        });
      }

      setLastSyncTime(new Date());
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      isSyncInProgress.current = false;
      setIsSyncing(false);
    }

    if (result.failed > 0 || result.succeeded > 0) {
      const event = new CustomEvent("offlineSync", {
        detail: result,
      });
      window.dispatchEvent(event);
    }

    return result;
  }, [queue, isOnline, isSyncing, removeFromQueue]);

  const getStats = useCallback((): QueueStats => {
    const failed = queue.filter((r) => r.retries >= r.maxRetries).length;
    const byEntity = queue.reduce(
      (acc, r) => {
        acc[r.entityType] = (acc[r.entityType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total: queue.length,
      pending: queue.length - failed,
      failed,
      byEntity,
    };
  }, [queue]);

  const toggleOfflineMode = useCallback((enabled: boolean) => {
    setIsOfflineModeEnabled(enabled);
    localStorage.setItem("offlineModeEnabled", String(enabled));
  }, []);

  useEffect(() => {
    const savedPreference = localStorage.getItem("offlineModeEnabled");
    if (savedPreference) {
      setIsOfflineModeEnabled(savedPreference === "true");
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log("Connection restored - syncing queue");
      syncQueue().catch((err) => {
        console.error("Error syncing queue:", err);
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log("Connection lost - offline mode active");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncQueue]);

  // Remount without auto-polling as per user instructions
  useEffect(() => {
    // Left intentionally blank - wait for connectivity events only
  }, []);

  return {
    // State
    queue,
    isSyncing,
    isOnline,
    isOfflineModeEnabled,
    lastSyncTime,

    // Methods
    addToQueue,
    removeFromQueue,
    retryRequest,
    clearQueue,
    syncQueue,
    getStats,
    toggleOfflineMode,

    get pendingMutationCount() {
      return queue.length;
    },
  };
};
