"use client";
import * as React from "react";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  type SortingState,
  getSortedRowModel,
  type ColumnFiltersState,
  getFilteredRowModel,
  type VisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "../ui/button";

const DEFAULT_PAGE_SIZE = 20;

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  name: string;
  searchColumn?: string;
  onSelectionChange?: (selectedRows: TData[]) => void;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  pageSize?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onSelectionChange,
  hasNextPage,
  onLoadMore,
  loadingMore,
  pageSize = DEFAULT_PAGE_SIZE,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const [pendingAdvance, setPendingAdvance] = React.useState(false);
  const prevDataLengthRef = React.useRef(data.length);

  const useCursorPagination = onLoadMore !== undefined;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    initialState: {
      pagination: { pageSize },
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      setRowSelection((prev) =>
        typeof updater === "function" ? updater(prev) : updater,
      );
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  React.useEffect(() => {
    if (pendingAdvance && data.length > prevDataLengthRef.current) {
      table.nextPage();
      setPendingAdvance(false);
    }
    prevDataLengthRef.current = data.length;
  }, [data.length, pendingAdvance, table]);

  React.useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table
        .getRowModel()
        .rows.filter((row) => rowSelection[row.id])
        .map((row) => row.original);
      onSelectionChange(selectedRows);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection]);

  const handleNext = () => {
    if (table.getCanNextPage()) {
      table.nextPage();
    } else if (useCursorPagination && hasNextPage) {
      setPendingAdvance(true);
      onLoadMore!();
    }
  };

  const isNextDisabled =
    (!table.getCanNextPage() && !(useCursorPagination && hasNextPage)) ||
    loadingMore ||
    pendingAdvance;

  const { pageIndex, pageSize: currentPageSize } = table.getState().pagination;
  const totalLoaded = table.getFilteredRowModel().rows.length;
  const firstRow = totalLoaded === 0 ? 0 : pageIndex * currentPageSize + 1;
  const lastRow = Math.min((pageIndex + 1) * currentPageSize, totalLoaded);

  return (
    <div>
      <div className="overflow-hidden rounded-md border p-1">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-5"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center px-5"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-end space-x-2 py-4 mx-4">
          <div className="text-muted-foreground flex-1 text-sm">
            {table.getFilteredSelectedRowModel().rows.length} of {totalLoaded}{" "}
            row(s) selected.
            {totalLoaded > 0 && (
              <span className="ml-2">
                Showing {firstRow}–{lastRow}
                {useCursorPagination && hasNextPage
                  ? "+"
                  : ` of ${totalLoaded}`}
              </span>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={
              !table.getCanPreviousPage() || loadingMore || pendingAdvance
            }
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={isNextDisabled}
          >
            {loadingMore || pendingAdvance ? "Loading..." : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
