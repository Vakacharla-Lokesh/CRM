import { useState, useEffect, useCallback, useRef } from "react";
import { API_BASE_URL, getToken } from "../services/api/core";

interface OfflineRequest {
  id: string;
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
  timestamp: number;
  retries: number;
  maxRetries: number;
  idempotencyKey: string;
  entityType:
    | "leads"
    | "deals"
    | "comments"
    | "calls"
    | "attachments"
    | "organizations"
    | "users";
  operationType: "create" | "update" | "delete";
}

interface QueueStats {
  total: number;
  pending: number;
  failed: number;
  byEntity: Record<string, number>;
}

interface SyncResult {
  succeeded: number;
  failed: number;
  errors: Array<{ entityType: string; error: string }>;
}

export const useOfflineManager = () => {
  const [queue, setQueue] = useState<OfflineRequest[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [isOfflineModeEnabled, setIsOfflineModeEnabled] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const queueRef = useRef<Map<string, OfflineRequest>>(new Map());
  const syncIntervalRef = useRef<number | null>(null);

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
    if (!isOnline || isSyncing || queue.length === 0) {
      return { succeeded: 0, failed: 0, errors: [] };
    }

    setIsSyncing(true);

    const result: SyncResult = {
      succeeded: 0,
      failed: 0,
      errors: [],
    };

    try {
      const grouped = queue.reduce(
        (acc, request) => {
          const key = `${request.entityType}-${request.operationType}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(request);
          return acc;
        },
        {} as Record<string, OfflineRequest[]>,
      );

      for (const [key, requests] of Object.entries(grouped)) {
        const [entityType, operationType] = key.split("-") as [
          OfflineRequest["entityType"],
          OfflineRequest["operationType"],
        ];

        try {
          const payload = requests.map((req) => req.body);

          const bulkEndpoint = `${API_BASE_URL}/bulk/${entityType}/${operationType}`;

          const token = getToken();

          const response = await fetch(bulkEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(
              operationType === "create"
                ? { [entityType]: payload }
                : { updates: payload },
            ),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          requests.forEach((req) => {
            removeFromQueue(req.id);
          });

          result.succeeded += data.created || data.updated || requests.length;
        } catch (error) {
          console.error(`Failed to sync ${key}:`, error);

          requests.forEach((req) => {
            if (req.retries < req.maxRetries) {
              retryRequest(req.id);
            } else {
              // Max retries exhausted — remove from queue to stop spamming
              removeFromQueue(req.id);
              result.failed += 1;
              result.errors.push({
                entityType,
                error: error instanceof Error ? error.message : "Unknown error",
              });
            }
          });
        }
      }

      setLastSyncTime(new Date());
      setIsSyncing(false);
    } catch (error) {
      console.log("Sync error:", error);
      setIsSyncing(false);
    }

    if (result.failed > 0 || result.succeeded > 0) {
      const event = new CustomEvent("offlineSync", {
        detail: result,
      });
      window.dispatchEvent(event);
    }

    return result;
  }, [queue, isOnline, isSyncing, removeFromQueue, retryRequest]);

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

  // Auto-sync when online and queue has items
  useEffect(() => {
    if (!isOnline || queue.length === 0) {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      return;
    }

    // Initial sync
    syncQueue().catch((err) => {
      console.error("Error syncing queue:", err);
    });

    // Poll every 30 seconds while online and queue has items
    syncIntervalRef.current = setInterval(() => {
      syncQueue().catch((err) => {
        console.error("Error syncing queue:", err);
      });
    }, 30000);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [isOnline, queue.length, syncQueue]);

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
