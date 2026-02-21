import { useState } from "react";
import {
  Radio,
  RefreshCw,
  HardDrive,
  Settings,
  Circle,
  ChevronDown,
  BarChart2,
  Search,
  Zap,
  WifiOff,
  Wifi,
} from "lucide-react";
import ConnectivityLEDs from "../common/connectivityLEDs";
import SyncBadge from "../common/syncBadge";
import MemoryVisualizer from "../common/memoryVisualizer";
import WorkerStatus from "../common/workerStatus";
import LiveFeed from "../common/liveFeed";
import { useOffline } from "@/context/OfflineContext";
import type {
  ExpandedSections,
  RightPanelProps,
  SectionProps,
} from "@/types/interfaces/layout/rightPanel.interfaces";

const Section = ({
  title,
  children,
  icon,
  isExpanded,
  onToggle,
}: SectionProps) => (
  <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="text-gray-700 dark:text-gray-300">{icon}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {title}
        </span>
      </div>
      <span
        className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
      >
        <ChevronDown
          size={16}
          className="text-gray-500 dark:text-gray-400"
        />
      </span>
    </button>
    {isExpanded && <div className="px-4 pb-4">{children}</div>}
  </div>
);

function RightPanel({ isOpen }: RightPanelProps) {
  const {
    isOfflineModeEnabled,
    toggleOfflineMode,
    getStats,
    syncQueue,
    isSyncing,
    isOnline: offlineManagerIsOnline,
  } = useOffline();
  
  const stats = getStats();
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    quickActions: true,
    connectivity: true,
    sync: true,
    memory: true,
    worker: true,
    liveFeed: true,
  });

  const handleToggleOfflineMode = () => {
    toggleOfflineMode(!isOfflineModeEnabled);
  };

  const handleSync = async () => {
    if (!isSyncing && stats.pending > 0) {
      try {
        await syncQueue();
      } catch (error) {
        console.error("Sync failed:", error);
      }
    }
  };

  const handleStressTest = () => {
    console.log("Stress test triggered");
  };

  const handleDiagnostics = () => {
    console.log("Diagnostics triggered");
  };

  const toggleSection = (section: keyof ExpandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!isOpen) {
    return null;
  }

  return (
    <aside
      className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto flex flex-col"
      style={{
        height: "calc(100vh - 4rem)",
        position: "sticky",
        top: "4rem",
      }}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Monitoring
          </h2>
        </div>

        <Section
          id="quickActions"
          title="Quick Actions"
          icon={<Zap size={18} />}
          isExpanded={expandedSections.quickActions}
          onToggle={() => toggleSection("quickActions")}
        >
          <div className="space-y-2">
            <button
              onClick={handleToggleOfflineMode}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg shadow transition-colors ${
                isOfflineModeEnabled
                  ? "text-white bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
                  : "text-white bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600"
              }`}
              title={
                isOfflineModeEnabled
                  ? "Offline mode enabled - all requests go to queue"
                  : "Offline mode disabled - requests go directly to server"
              }
            >
              {isOfflineModeEnabled ? (
                <WifiOff size={16} />
              ) : (
                <Wifi size={16} />
              )}
              <span>{isOfflineModeEnabled ? "Offline Mode ON" : "Offline Mode OFF"}</span>
            </button>

            <button
              onClick={handleSync}
              disabled={isSyncing || stats.pending === 0 || !offlineManagerIsOnline}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg shadow transition-colors ${
                offlineManagerIsOnline && stats.pending > 0
                  ? "text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                  : "text-white bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
              }`}
              title={
                !offlineManagerIsOnline
                  ? "Cannot sync while offline"
                  : stats.pending === 0
                  ? "Nothing to sync"
                  : `${stats.pending} items pending sync`
              }
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  offlineManagerIsOnline && stats.pending > 0 ? "bg-green-300 animate-pulse" : "bg-gray-300"
                }`}
              />
              <span>{isSyncing ? "Syncing..." : "Sync Queue"}</span>
              {stats.pending > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full font-bold">
                  {stats.pending}
                </span>
              )}
            </button>

            <button
              onClick={handleStressTest}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow transition-colors"
              title="Run stress test (1000 leads)"
            >
              <BarChart2 size={16} />
              <span>Stress Test</span>
            </button>

            <button
              onClick={handleDiagnostics}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 rounded-lg shadow transition-colors"
              title="View event loop diagnostics"
            >
              <Search size={16} />
              <span>Diagnostics</span>
            </button>
          </div>
        </Section>

        <Section
          id="connectivity"
          title="Connection Status"
          icon={<Radio size={18} />}
          isExpanded={expandedSections.connectivity}
          onToggle={() => toggleSection("connectivity")}
        >
          <ConnectivityLEDs />
        </Section>

        <Section
          id="sync"
          title="Sync Status"
          icon={<RefreshCw size={18} />}
          isExpanded={expandedSections.sync}
          onToggle={() => toggleSection("sync")}
        >
          <SyncBadge />
        </Section>

        <Section
          id="memory"
          title="Memory Usage"
          icon={<HardDrive size={18} />}
          isExpanded={expandedSections.memory}
          onToggle={() => toggleSection("memory")}
        >
          <MemoryVisualizer />
        </Section>

        <Section
          id="worker"
          title="Web Worker"
          icon={<Settings size={18} />}
          isExpanded={expandedSections.worker}
          onToggle={() => toggleSection("worker")}
        >
          <WorkerStatus />
        </Section>

        <Section
          id="liveFeed"
          title="Live Events"
          icon={
            <Circle
              size={18}
              className="fill-red-500 text-red-500"
            />
          }
          isExpanded={expandedSections.liveFeed}
          onToggle={() => toggleSection("liveFeed")}
        >
          <div className="max-h-96">
            <LiveFeed />
          </div>
        </Section>
      </div>
    </aside>
  );
}

export default RightPanel;
