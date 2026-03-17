import { useEffect, type ReactNode } from "react";
import { useOfflineManager } from "../hooks/useOfflineManager";
import { OfflineContext } from "./useOffline";

export const OfflineProvider = ({ children }: { children: ReactNode }) => {
  const offlineManager = useOfflineManager();

  useEffect(() => {
    const handlePrepareLogout = async () => {
      console.log("🔄 Syncing offline queue before logout...");
      try {
        const result = await offlineManager.syncQueue();
        console.log("✅ Offline queue synced before logout:", result);
      } catch (error) {
        console.error("❌ Failed to sync queue on logout:", error);
      }
    };

    window.addEventListener("app:prepare-logout", handlePrepareLogout);
    return () => {
      window.removeEventListener("app:prepare-logout", handlePrepareLogout);
    };
  }, [offlineManager]);

  return (
    <OfflineContext.Provider value={offlineManager}>
      {children}
    </OfflineContext.Provider>
  );
};
