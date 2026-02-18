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

/**
 * Generate idempotency key for request
 */
const generateIdempotencyKey = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Offline Manager Hook
 * Manages offline requests queue and syncing
 *
 * @returns Offline manager utilities
 */
export const useOfflineManager = () => {
  const [queue, setQueue] = useState<OfflineRequest[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const queueRef = useRef<Map<string, OfflineRequest>>(new Map());

  /**
   * Add request to offline queue
   */
  const addToQueue = useCallback(
    (
      url: string,
      method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" = "POST",
      body?: unknown,
      headers?: Record<string, string>,
      maxRetries = 3,
    ): string => {
      const idempotencyKey = generateIdempotencyKey();
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

  /**
   * Remove request from queue
   */
  const removeFromQueue = useCallback((requestId: string) => {
    queueRef.current.delete(requestId);
    setQueue(Array.from(queueRef.current.values()));
  }, []);

  /**
   * Retry failed request
   */
  const retryRequest = useCallback((requestId: string) => {
    const request = queueRef.current.get(requestId);
    if (request) {
      request.retries += 1;
      queueRef.current.set(requestId, request);
      setQueue(Array.from(queueRef.current.values()));
    }
  }, []);

  /**
   * Clear entire queue
   */
  const clearQueue = useCallback(() => {
    queueRef.current.clear();
    setQueue([]);
  }, []);

  /**
   * Sync offline requests
   */
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

        // Request succeeded, remove from queue
        removeFromQueue(request.id);
      } catch (error) {
        console.error(`Failed to sync request ${request.id}:`, error);

        // Check if we should retry
        if (request.retries < request.maxRetries) {
          retryRequest(request.id);
        } else {
          // Max retries exceeded, add to failed list
          failedRequests.push(request);
        }
      }
    }

    setIsSyncing(false);

    // Dispatch event for failed requests
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

  /**
   * Get queue statistics
   */
  const getStats = useCallback((): QueueStats => {
    const failed = queue.filter((r) => r.retries >= r.maxRetries).length;
    return {
      total: queue.length,
      pending: queue.length - failed,
      failed,
    };
  }, [queue]);

  /**
   * Monitor online/offline status
   */
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming back online
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

  /**
   * Periodically sync queue if online
   */
  useEffect(() => {
    if (!isOnline || queue.length === 0) return;

    const interval = setInterval(() => {
      syncQueue().catch((err) => {
        console.error("Error syncing queue:", err);
      });
    }, 30000); // Sync every 30 seconds

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
