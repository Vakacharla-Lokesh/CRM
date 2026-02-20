"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { BarChart3 } from "lucide-react";

interface MonitoringToggleButtonProps {
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export const MonitoringToggleButton: React.FC<MonitoringToggleButtonProps> = ({
  isOpen = false,
  onToggle,
  className,
}) => {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle monitoring panel"
      title="Toggle monitoring panel"
      className={cn(
        "p-2 rounded-lg transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-ring/50",
        isOpen
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-primary",
        className,
      )}
    >
      <BarChart3 className="w-5 h-5" />
    </button>
  );
};
