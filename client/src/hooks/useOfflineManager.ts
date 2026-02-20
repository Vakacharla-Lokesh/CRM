import { useState, useEffect, useCallback, useRef } from "react";

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
}

interface QueueStats {
  total: number;
  pending: number;
  failed: number;
}

export const useOfflineManager = () => {
  const [queue, setQueue] = useState<OfflineRequest[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const queueRef = useRef<Map<string, OfflineRequest>>(new Map());

  const addToQueue = useCallback(
    (
      url: string,
      method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" = "POST",
      body?: unknown,
      headers?: Record<string, string>,
      maxRetries = 3,
    ): string => {
      const idempotencyKey = crypto.randomUUID();
      const request: OfflineRequest = {
        id: `${method}-${url}-${Date.now()}`,
        url,
        method,
        headers,
        body,
        timestamp: Date.now(),
        retries: 0,
        maxRetries,
        idempotencyKey,
      };

      queueRef.current.set(request.id, request);
      setQueue(Array.from(queueRef.current.values()));

      return idempotencyKey;
    },
    [],
  );

  const removeFromQueue = useCallback((requestId: string) => {
    queueRef.current.delete(requestId);
    setQueue(Array.from(queueRef.current.values()));
  }, []);

  const retryRequest = useCallback((requestId: string) => {
    const request = queueRef.current.get(requestId);
    if (request) {
      request.retries += 1;
      queueRef.current.set(requestId, request);
      setQueue(Array.from(queueRef.current.values()));
    }
  }, []);

  const clearQueue = useCallback(() => {
    queueRef.current.clear();
    setQueue([]);
  }, []);

  const syncQueue = useCallback(async (): Promise<void> => {
    if (!isOnline || isSyncing || queue.length === 0) {
      return;
    }

    setIsSyncing(true);

    const failedRequests: OfflineRequest[] = [];

    for (const request of queue) {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": request.idempotencyKey,
            ...request.headers,
          },
          body:
            request.body && request.method !== "GET"
              ? JSON.stringify(request.body)
              : null,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        removeFromQueue(request.id);
      } catch (error) {
        console.error(`Failed to sync request ${request.id}:`, error);

        if (request.retries < request.maxRetries) {
          retryRequest(request.id);
        } else {
          failedRequests.push(request);
        }
      }
    }

    setIsSyncing(false);

    if (failedRequests.length > 0) {
      const event = new CustomEvent("offlineSync", {
        detail: {
          failed: failedRequests,
          succeeded: queue.length - failedRequests.length,
        },
      });
      window.dispatchEvent(event);
    }
  }, [queue, isOnline, isSyncing, removeFromQueue, retryRequest]);

  const getStats = useCallback((): QueueStats => {
    const failed = queue.filter((r) => r.retries >= r.maxRetries).length;
    return {
      total: queue.length,
      pending: queue.length - failed,
      failed,
    };
  }, [queue]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncQueue().catch((err) => {
        console.error("Error syncing queue:", err);
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncQueue]);

  useEffect(() => {
    if (!isOnline || queue.length === 0) return;

    const interval = setInterval(() => {
      syncQueue().catch((err) => {
        console.error("Error syncing queue:", err);
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [isOnline, queue.length, syncQueue]);

  return {
    // State
    queue,
    isSyncing,
    isOnline,

    // Methods
    addToQueue,
    removeFromQueue,
    retryRequest,
    clearQueue,
    syncQueue,
    getStats,
  };
};
