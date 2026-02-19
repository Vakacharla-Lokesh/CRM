import type { ReactNode } from "react";

export interface RightPanelProps {
  isOpen: boolean;
}

export interface ExpandedSections {
  quickActions: boolean;
  connectivity: boolean;
  sync: boolean;
  memory: boolean;
  worker: boolean;
  liveFeed: boolean;
}

export interface SectionProps {
  id: keyof ExpandedSections;
  title: string;
  children: ReactNode;
  icon: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}
