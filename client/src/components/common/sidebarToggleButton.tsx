"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarToggleButtonProps {
  onToggle: () => void;
  className?: string;
}

export const SidebarToggleButton: React.FC<
  SidebarToggleButtonProps
> = ({ onToggle, className }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      aria-label="Toggle sidebar"
      className={cn(
        "hover:bg-accent hover:text-primary transition-colors",
        className
      )}
    >
      <Menu className="w-6 h-6" />
    </Button>
  );
};