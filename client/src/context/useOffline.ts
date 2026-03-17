import { createContext, useContext } from "react";
import type { OfflineContextType } from "@/types/interfaces/offlineInterfaces";

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error("useOffline must be used within an OfflineProvider");
  }
  return context;
};

export const OfflineContext = createContext<OfflineContextType | null>(null);
