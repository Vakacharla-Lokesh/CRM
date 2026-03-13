import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import type { ApiError } from "./types";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed queries
      retry: (failureCount, error: ApiError) => {
        const status =
          (error as ApiError & { statusCode?: number }).statusCode ??
          error.status;
        if (status === 401 || status === 403) return false;
        if (status === 404) return false;
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Stale time configuration
      staleTime: 60 * 1000,

      networkMode: "online",

      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },

    mutations: {
      retry: 0,
      networkMode: "online",
      onError: (error: ApiError) => {
        console.error("Mutation error:", error);
      },
    },
  },
});

export const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});

// Persist query client to localStorage
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => query.state.status === "success",
  },
});

export const isOnline = () => {
  return navigator.onLine;
};
