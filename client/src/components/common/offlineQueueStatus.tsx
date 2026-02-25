import { useOffline } from "@/context/useOffline";
import { cn } from "@/lib/utils";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";

function formatTime(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

export function OfflineQueueStatus() {
  const { queue, isSyncing, isOnline, lastSyncTime, syncQueue, getStats } =
    useOffline();

  const stats = getStats();

  const handleSync = async () => {
    if (!isSyncing && isOnline) {
      await syncQueue();
    }
  };

  const statusColor = !isOnline
    ? "text-orange-500"
    : stats.pending > 0
      ? "text-yellow-500"
      : "text-emerald-500";

  const statusLabel = !isOnline
    ? "Offline"
    : isSyncing
      ? "Syncing…"
      : stats.pending > 0
        ? "Pending sync"
        : "All synced";

  return (
    <div className="px-3 py-2.5 bg-muted/50 rounded-lg mx-2 mb-1">
      {/* Header row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {isOnline ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-orange-500" />
          )}
          <span className="text-xs font-semibold text-foreground">
            Offline Queue
          </span>
        </div>

        {/* Sync button */}
        {isOnline && stats.pending > 0 && (
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={cn("w-3 h-3", isSyncing && "animate-spin")} />
            Sync now
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">{queue.length}</span>{" "}
          queued
        </span>
        {stats.failed > 0 && (
          <span className="text-red-500">
            <span className="font-medium">{stats.failed}</span> failed
          </span>
        )}
        <span className={cn("ml-auto font-medium", statusColor)}>
          {statusLabel}
        </span>
      </div>

      {/* Last sync */}
      {lastSyncTime && (
        <p className="text-[10px] text-muted-foreground mt-1">
          Last synced {formatTime(lastSyncTime)}
        </p>
      )}
    </div>
  );
}
