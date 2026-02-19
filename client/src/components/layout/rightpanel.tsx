/* eslint-disable react-hooks/static-components */
import { useState } from "react";
import {
  Radio,
  RefreshCw,
  HardDrive,
  Settings,
  Circle,
  ChevronDown,
} from "lucide-react";
import ConnectivityLEDs from "../common/connectivityLEDs";
import SyncBadge from "../common/syncBadge";
import MemoryVisualizer from "../common/memoryVisualizer";
import WorkerStatus from "../common/workerStatus";
import LiveFeed from "../common/liveFeed";
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
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    connectivity: true,
    sync: true,
    memory: true,
    worker: true,
    liveFeed: true,
  });

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
