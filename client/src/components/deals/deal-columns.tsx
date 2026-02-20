"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

import { type Deal } from "@/types";

export const columns: ColumnDef<Deal>[] = [
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
    accessorKey: "dealName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Deal Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "organizationId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Organization
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "dealValue",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Value
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue("dealValue") as number;
      return (
        <span className="font-medium">
          ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </span>
      );
    },
  },
  {
    accessorKey: "dealStatus",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("dealStatus") as string;
      const statusColors: Record<string, string> = {
        Prospecting:
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        Qualification:
          "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
        Negotiation:
          "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
        "Ready to close":
          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
        "Closed Won":
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        "Closed Lost":
          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      };
      const colorClass =
        statusColors[status] ||
        "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return new Date(date).toLocaleDateString();
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const deal = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(deal._id)}
            >
              Copy deal ID
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <Pencil className="w-4 h-4" />
              Edit
            </DropdownMenuItem>

            <DropdownMenuItem className="flex items-center gap-2 text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
