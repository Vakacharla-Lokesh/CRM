/* eslint-disable react-hooks/static-components */
import React, { useState } from "react";
import ConnectivityLEDs from "../common/connectivityLEDs";
import SyncBadge from "../common/syncBadge";
import MemoryVisualizer from "../common/memoryVisualizer";
import WorkerStatus from "../common/workerStatus";
import LiveFeed from "../common/liveFeed";

function RightPanel({ isOpen }) {
  const [expandedSections, setExpandedSections] = useState({
    connectivity: true,
    sync: true,
    memory: true,
    worker: true,
    liveFeed: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!isOpen) {
    return null;
  }

  const Section = ({ id, title, children, icon }) => (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {title}
          </span>
        </div>
        <span
          className={`transition-transform ${expandedSections[id] ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>
      {expandedSections[id] && <div className="px-4 pb-4">{children}</div>}
    </div>
  );

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
          icon="📡"
        >
          <ConnectivityLEDs />
        </Section>

        <Section
          id="sync"
          title="Sync Status"
          icon="🔄"
        >
          <SyncBadge />
        </Section>

        <Section
          id="memory"
          title="Memory Usage"
          icon="💾"
        >
          <MemoryVisualizer />
        </Section>

        <Section
          id="worker"
          title="Web Worker"
          icon="⚙️"
        >
          <WorkerStatus />
        </Section>

        <Section
          id="liveFeed"
          title="Live Events"
          icon="🔴"
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
