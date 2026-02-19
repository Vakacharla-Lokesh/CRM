import type { PerformanceWithMemory } from "@/types/interfaces/common/memoryVisualizer.interfaces";
import { useEffect, useState, useRef } from "react";

function MemoryVisualizer() {
  const [memoryData, setMemoryData] = useState<number[]>([]);
  const [currentMemory, setCurrentMemory] = useState(0);
  const [maxMemory, setMaxMemory] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line react-hooks/purity
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
          if (timeSinceLastClear >= 5000) {
            // Clear graph every 5 seconds
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

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const min = Math.min(...memoryData);
    const max = Math.max(...memoryData);
    const range = max - min || 1;

    // Grid lines (using theme border color)
    const gridColor =
      getComputedStyle(document.documentElement).getPropertyValue(
        "--color-border",
      ) || "#d6d3d1";
    ctx.strokeStyle = gridColor.trim();
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Memory line color from theme
    const lineColor =
      getComputedStyle(document.documentElement).getPropertyValue(
        "--color-chart-1",
      ) || "#6366f1";
    const fillColor = lineColor.trim() + "1A"; // 10% opacity

    ctx.strokeStyle = lineColor.trim();
    ctx.lineWidth = 2;
    ctx.beginPath();

    memoryData.forEach((value, index) => {
      const x = (index / (memoryData.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    // Fill under the line
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
  }, [memoryData]);

  return (
    <div className="p-3 bg-card dark:bg-card rounded-lg border border-border dark:border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-foreground dark:text-foreground uppercase">
          JS Heap Memory
        </h3>
        <span className="text-xs px-2 py-1 bg-accent dark:bg-accent-foreground/30 text-accent-foreground dark:text-accent rounded font-mono">
          {currentMemory}MB
        </span>
      </div>

      <canvas
        ref={canvasRef}
        width={250}
        height={60}
        className="w-full border border-border dark:border-border rounded mb-2"
      />

      <div className="space-y-1 text-xs text-muted-foreground dark:text-muted-foreground">
        <div className="flex justify-between">
          <span>Used:</span>
          <span className="font-mono font-semibold text-primary dark:text-primary-foreground">
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
        <div className="mt-3 p-2 bg-destructive/10 dark:bg-destructive-foreground/20 rounded">
          <p className="text-xs text-destructive dark:text-destructive-foreground font-semibold">
            ⚠️ Memory usage high
          </p>
        </div>
      )}
    </div>
  );
}

export default MemoryVisualizer;
