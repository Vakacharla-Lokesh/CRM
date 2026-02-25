import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data considered fresh for 5 minutes — avoids redundant refetches
      staleTime: 1000 * 60 * 5,
      // Cache retained for 10 minutes after component unmounts
      gcTime: 1000 * 60 * 10,
      // Retry failed requests once with exponential backoff
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
      // Do NOT auto-retry when offline — our IndexedDB offline queue handles that
      networkMode: "online",
    },
    mutations: {
      // Same rationale: offline mutations are captured by useOfflineManager
      networkMode: "online",
    },
  },
});
