import type { PerformanceWithMemory } from "@/types/interfaces/common/memoryVisualizer.interfaces";
import { useEffect, useState, useRef } from "react";

function MemoryVisualizer() {
  const [memoryData, setMemoryData] = useState<number[]>([]);
  const [currentMemory, setCurrentMemory] = useState(0);
  const [maxMemory, setMaxMemory] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastClearTime = useRef<number>(Date.now());

  useEffect(() => {
    const collectMemoryData = () => {
      const perf = performance as PerformanceWithMemory;
      if (perf.memory) {
        const usedMemory = Math.round(perf.memory.usedJSHeapSize / 1048576);
        const jsHeapLimit = Math.round(perf.memory.jsHeapSizeLimit / 1048576);

        setCurrentMemory(usedMemory);
        setMaxMemory(jsHeapLimit);

        const now = Date.now();
        const timeSinceLastClear = now - lastClearTime.current;

        setMemoryData((prev) => {
          // Clear graph every 5 seconds
          if (timeSinceLastClear >= 5000) {
            lastClearTime.current = now;
            return [usedMemory];
          }
          return [...prev, usedMemory];
        });
      }
    };

    const interval = setInterval(collectMemoryData, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || memoryData.length < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = "transparent";
    ctx.fillRect(0, 0, width, height);

    const min = Math.min(...memoryData);
    const max = Math.max(...memoryData);
    const range = max - min || 1;

    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.beginPath();

    memoryData.forEach((value, index) => {
      const x = (index / (memoryData.length - 1)) * width;
      const y = height - ((value - min) / range) * height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
    ctx.fill();
  }, [memoryData]);

  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
          JS Heap Memory
        </h3>
        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded font-mono">
          {currentMemory}MB
        </span>
      </div>

      <canvas
        ref={canvasRef}
        width={250}
        height={60}
        className="w-full border border-gray-200 dark:border-gray-600 rounded mb-2"
      />

      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex justify-between">
          <span>Used:</span>
          <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
            {currentMemory} MB
          </span>
        </div>
        <div className="flex justify-between">
          <span>Limit:</span>
          <span className="font-mono font-semibold">{maxMemory} MB</span>
        </div>
        <div className="flex justify-between">
          <span>Usage:</span>
          <span className="font-mono font-semibold">
            {maxMemory > 0 ? ((currentMemory / maxMemory) * 100).toFixed(1) : 0}
            %
          </span>
        </div>
      </div>

      {maxMemory > 0 && currentMemory / maxMemory > 0.85 && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded">
          <p className="text-xs text-red-700 dark:text-red-400 font-semibold">
            ⚠️ Memory usage high
          </p>
        </div>
      )}
    </div>
  );
}

export default MemoryVisualizer;
