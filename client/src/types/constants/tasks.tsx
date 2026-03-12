import type { Task } from "@/services/api/tasks.api";

export const COLUMNS: { id: Task["status"]; label: string; color: string }[] = [
  { id: "todo", label: "To Do", color: "bg-slate-100 dark:bg-slate-800" },
  {
    id: "in_progress",
    label: "In Progress",
    color: "bg-blue-50 dark:bg-blue-950",
  },
  {
    id: "in_review",
    label: "In Review",
    color: "bg-yellow-50 dark:bg-yellow-950",
  },
  { id: "done", label: "Done", color: "bg-green-50 dark:bg-green-950" },
];

export const PRIORITY_BADGE: Record<
  Task["priority"],
  { label: string; className: string }
> = {
  low: {
    label: "Low",
    className:
      "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  },
  medium: {
    label: "Medium",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  high: {
    label: "High",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  },
  urgent: {
    label: "Urgent",
    className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  },
};
