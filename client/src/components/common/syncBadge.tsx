import { useEffect, useState } from "react";

function SyncBadge() {
  const [queueCount, setQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    // Listen for offline queue changes
    // This will be connected to IndexedDB in Phase 4
    const updateQueueCount = () => {
      // Placeholder: in real app, this comes from offlineManager
      setQueueCount(
        Math.max(0, Math.random() > 0.8 ? Math.floor(Math.random() * 10) : 0),
      );
    };

    updateQueueCount();
    const interval = setInterval(updateQueueCount, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      // Simulate sync operation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setQueueCount(0);
      setLastSyncTime(new Date());
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
          Sync Status
        </h3>
        {isSyncing && (
          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded font-semibold animate-pulse">
            Syncing...
          </span>
        )}
      </div>

      {queueCount > 0 ? (
        <div className="space-y-3">
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
            <p className="text-sm font-bold text-yellow-700 dark:text-yellow-400">
              {queueCount} {queueCount === 1 ? "item" : "items"} pending
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
              Changes will sync when online
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSyncing ? "Syncing..." : "Sync Now"}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-green-700 dark:text-green-400 font-medium">
              All synced
            </span>
          </div>
          {lastSyncTime && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last sync: {lastSyncTime.toLocaleTimeString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default SyncBadge;
