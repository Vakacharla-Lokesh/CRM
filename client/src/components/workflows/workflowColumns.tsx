"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle2, MoreHorizontal, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Workflow } from "@/types/workflows";

interface ColumnsProps {
  onEdit?: (workflow: Workflow) => void;
  onDelete?: (id: string) => void;
  onToggle?: (id: string) => void;
  onViewLogs?: (workflow: Workflow) => void;
}

export const columns = ({
  onEdit,
  onDelete,
  onToggle,
  onViewLogs,
}: ColumnsProps = {}): ColumnDef<Workflow>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="mx-3"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const desc = row.getValue("description") as string | undefined;
      return (
        <span className="text-muted-foreground text-sm line-clamp-1 max-w-48">
          {desc || "—"}
        </span>
      );
    },
  },
  {
    id: "trigger",
    header: "Trigger",
    cell: ({ row }) => {
      const { entity, action } = row.original.trigger;
      return (
        <div className="flex gap-1 flex-wrap">
          <Badge variant="outline" className="capitalize">
            {entity}
          </Badge>
          <Badge variant="secondary" className="capitalize">
            {action}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions_count",
    header: "Actions",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.actions.length} action(s)</span>
    ),
  },
  {
    accessorKey: "totalExecutions",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Executions
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("totalExecutions")}</span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const active = row.getValue("isActive") as boolean;
      return active ? (
        <span className="flex items-center gap-1 text-green-600 text-sm">
          <CheckCircle2 className="h-4 w-4" />
          Active
        </span>
      ) : (
        <span className="flex items-center gap-1 text-muted-foreground text-sm">
          <XCircle className="h-4 w-4" />
          Inactive
        </span>
      );
    },
  },
  {
    id: "createdBy",
    header: "Created By",
    cell: ({ row }) => {
      const { createdBy } = row.original;
      return (
        <span className="text-sm text-muted-foreground">
          {createdBy
            ? `${createdBy.firstName} ${createdBy.lastName}`
            : "—"}
        </span>
      );
    },
  },
  {
    id: "row_actions",
    header: "",
    cell: ({ row }) => {
      const workflow = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit?.(workflow)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggle?.(workflow._id)}>
              {workflow.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewLogs?.(workflow)}>
              View Logs
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete?.(workflow._id)}
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
