import type { Task } from "@/services/api/tasks.api";
import { CheckCircle2, Circle, Clock, AlertCircle, Zap } from "lucide-react";

export type StatusId = Task["status"];
export type PriorityLevel = Task["priority"];

export interface StatusConfig {
  id: StatusId;
  label: string;
  icon: React.ElementType;
  badgeClass: string;
  dotColor: string;
  columnColor: string;
}

export interface PriorityConfig {
  label: string;
  icon: React.ElementType;
  badgeClass: string;
  dotColor: string;
}

export const COLUMNS: StatusConfig[] = [
  {
    id: "todo",
    label: "To Do",
    icon: Circle,
    badgeClass: "bg-muted text-muted-foreground",
    dotColor: "bg-muted-foreground/50",
    columnColor: "bg-slate-100 dark:bg-slate-800",
  },
  {
    id: "in_progress",
    label: "In Progress",
    icon: Clock,
    badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    dotColor: "bg-blue-500",
    columnColor: "bg-blue-50 dark:bg-blue-950",
  },
  {
    id: "in_review",
    label: "In Review",
    icon: AlertCircle,
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    dotColor: "bg-amber-500",
    columnColor: "bg-yellow-50 dark:bg-yellow-950",
  },
  {
    id: "done",
    label: "Done",
    icon: CheckCircle2,
    badgeClass: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    dotColor: "bg-green-500",
    columnColor: "bg-green-50 dark:bg-green-950",
  },
];

export const PRIORITY_BADGE: Record<PriorityLevel, PriorityConfig> = {
  low: {
    label: "Low",
    icon: Circle,
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
    dotColor: "bg-slate-500",
  },
  medium: {
    label: "Medium",
    icon: AlertCircle,
    badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    dotColor: "bg-blue-500",
  },
  high: {
    label: "High",
    icon: Zap,
    badgeClass: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    dotColor: "bg-orange-500",
  },
  urgent: {
    label: "Urgent",
    icon: AlertCircle,
    badgeClass: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    dotColor: "bg-red-500",
  },
};
