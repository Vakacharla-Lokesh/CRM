import { useState } from "react";

interface WorkerState {
  isRunning: boolean;
  progress: number;
  processedItems: number;
  totalItems: number;
  startTime: number | null;
  estimatedTime: number | null;
}

function WorkerStatus() {
  const [workerState, setWorkerState] = useState<WorkerState>({
    isRunning: false,
    progress: 0,
    processedItems: 0,
    totalItems: 0,
    startTime: null,
    estimatedTime: null,
  });

  const handleStartScoring = () => {
    setWorkerState({
      isRunning: true,
      progress: 0,
      processedItems: 0,
      totalItems: 10000,
      startTime: Date.now(),
      estimatedTime: null,
    });

    // Simulate worker progress
    const interval = setInterval(() => {
      setWorkerState((prev) => {
        if (!prev.isRunning) {
          clearInterval(interval);
          return prev;
        }

        const newProcessed = Math.min(
          prev.processedItems + Math.floor(Math.random() * 500),
          prev.totalItems,
        );
        const progress = (newProcessed / prev.totalItems) * 100;
        const elapsed = prev.startTime ? Date.now() - prev.startTime : 0;
        const rate = elapsed > 0 ? newProcessed / (elapsed / 1000) : 0;
        const remaining = prev.totalItems - newProcessed;
        const estimatedTime = rate > 0 ? remaining / rate : 0;

        const isComplete = newProcessed >= prev.totalItems;

        if (isComplete) {
          clearInterval(interval);
        }

        return {
          ...prev,
          isRunning: !isComplete,
          progress: Math.round(progress),
          processedItems: newProcessed,
          estimatedTime: Math.round(estimatedTime),
        };
      });
    }, 500);

    return () => clearInterval(interval);
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds || seconds === 0) return "calculating...";
    if (seconds < 60) return `${Math.round(seconds)}s`;
    return `${Math.round(seconds / 60)}m`;
  };

  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
          Lead Scoring Worker
        </h3>
        {workerState.isRunning && (
          <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-semibold animate-pulse">
            Processing...
          </span>
        )}
      </div>

      {workerState.isRunning ? (
        <div className="space-y-3">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Progress
              </span>
              <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                {workerState.progress}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 dark:bg-purple-500 transition-all duration-300"
                style={{ width: `${workerState.progress}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Processed:</span>
              <span className="font-mono font-semibold">
                {workerState.processedItems.toLocaleString()} /{" "}
                {workerState.totalItems.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>ETA:</span>
              <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">
                {formatTime(workerState.estimatedTime)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={handleStartScoring}
          className="w-full px-3 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 rounded transition-colors"
        >
          Score 10,000 Leads
        </button>
      )}
    </div>
  );
}

export default WorkerStatus;
