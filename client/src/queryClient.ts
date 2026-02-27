import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { persistQueryClient } from "@tanstack/react-query-persist-client";

// Configure TanStack Query with offline support
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed queries
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Stale time configuration
      staleTime: 5 * 60 * 1000, // 5 minutes

      // Network mode - online queries won't run when offline
      networkMode: "online",

      // Refetch configuration
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },

    mutations: {
      // Retry failed mutations
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Network mode - mutations will be paused when offline
      networkMode: "online",

      // Global mutation error handler
      onError: (error: any) => {
        console.error("Mutation error:", error);
      },
    },
  },
});
const localStoragePersister = createSyncStoragePersister({
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
    // Only persist queries that succeeded
    shouldDehydrateQuery: (query) => query.state.status === "success",
  },
});
// Helper to check if device is online
export const isOnline = () => {
  return navigator.onLine;
};
