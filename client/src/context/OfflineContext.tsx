/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useOfflineManager } from "../hooks/useOfflineManager";

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
  entityType: "leads" | "deals" | "comments" | "calls" | "attachments" | "organizations" | "users";
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

interface OfflineContextType {
  queue: OfflineRequest[];
  isSyncing: boolean;
  isOnline: boolean;
  isOfflineModeEnabled: boolean;
  lastSyncTime: Date | null;
  addToQueue: (
    url: string,
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    body?: unknown,
    headers?: Record<string, string>,
    maxRetries?: number,
    entityType?: OfflineRequest["entityType"],
    operationType?: OfflineRequest["operationType"],
  ) => string;
  removeFromQueue: (requestId: string) => void;
  retryRequest: (requestId: string) => void;
  clearQueue: () => void;
  syncQueue: () => Promise<SyncResult>;
  getStats: () => QueueStats;
  toggleOfflineMode: (enabled: boolean) => void;
}

const OfflineContext = createContext<OfflineContextType | null>(null);

export const OfflineProvider = ({ children }: { children: ReactNode }) => {
  const offlineManager = useOfflineManager();

  return (
    <OfflineContext.Provider value={offlineManager}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error("useOffline must be used within an OfflineProvider");
  }
  return context;
};
