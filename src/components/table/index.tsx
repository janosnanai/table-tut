// TODO: asc/desc toggle into 2 buttons, advanced search menu, group actions for page and for every(!) result, a11y and i18n
import type { ChangeEvent } from "react";
import type {
  ColumnDef,
  ColumnOrderState,
  ColumnResizeMode,
  OnChangeFn,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  Updater,
} from "@tanstack/react-table";

import { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Table as MUITable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
} from "@mui/material";
import {
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import ColumnHeader from "./column-header";
import ViewMenu from "./view-menu";
import { useTimeout } from "../../hooks/use-timeout";
import { PAGE_LIMITS } from "../../config";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends unknown, TValue> {
    name?: string;
    draggable?: boolean;
  }
}

const defaultData = [] as any[];

export interface DataOptionsState {
  pagination: PaginationState;
  sorting: [];
  filter: { global: string };
}

interface MyTableProps<T> {
  columns: ColumnDef<T, any>[];
  data?: T[];
  count?: number;
  globalFilter: string;
  pagination: PaginationState;
  sorting: SortingState;
  setGlobalFilter: OnChangeFn<any>;
  setPagination: (update: PaginationState) => void;
  setSorting: (update: SortingState) => void;
  manualControl?: boolean;
}

function MyTable<T>({
  columns,
  count,
  data,
  globalFilter,
  pagination,
  sorting,
  setGlobalFilter,
  setPagination,
  setSorting,
  manualControl = false,
}: MyTableProps<T>) {
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    getDefaultColumnOrder()
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilterInput, setGlobalFilterInput] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [tableColumnDragging, setTableColumnDragging] = useState<string | null>(
    null
  );

  const columnResizeMode: ColumnResizeMode = "onChange";

  const { startTimeout, stopTimeout } = useTimeout(() => {
    setGlobalFilter(globalFilterInput);
  });

  const table = useReactTable({
    data: data || defaultData,
    columns,
    columnResizeMode,
    pageCount: count,
    state: {
      columnOrder,
      columnVisibility,
      globalFilter,
      pagination,
      rowSelection,
      sorting,
    },
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updaterFn: Updater<PaginationState>) => {
      const prev = { ...pagination };
      const update = functionalUpdate(updaterFn, prev);
      setPagination(update);
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: (updaterFn: Updater<SortingState>) => {
      const prev = [...sorting];
      const update = functionalUpdate(updaterFn, prev);
      setSorting(update);
    },
    enableRowSelection: true,
    manualFiltering: manualControl,
    manualPagination: manualControl,
    manualSorting: manualControl,
    enableMultiRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // @ts-ignore TODO
    getRowId: (row) => row.id as string,
  });

  function getDefaultColumnOrder() {
    return columns.map((col) => col.id as string);
  }

  function resetColumnOrder() {
    setColumnOrder(getDefaultColumnOrder());
  }

  function handleFilterChange(e: ChangeEvent<HTMLInputElement>) {
    setGlobalFilterInput(e.target.value);
    startTimeout();
  }

  function handlePageChange(_e: unknown, update: number) {
    table.setPageIndex(update);
    stopTimeout();
  }

  function handleRowsPerPageChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const update = parseInt(e.target.value);
    table.setPageSize(update);
    stopTimeout();
  }

  return (
    <Paper component="div" sx={{ background: "#ddd" }}>
      <Box sx={{ p: 3 }}>
        <Paper
          sx={{
            display: "inline-flex",
            gap: 3,
            p: 3,
            mb: 3,
            alignItems: "center",
          }}
        >
          <TextField
            onChange={handleFilterChange}
            value={globalFilterInput}
            placeholder="type searchterm..."
          />
          <ViewMenu<T> table={table} />
          <Button variant="contained" onClick={resetColumnOrder}>
            reset order
          </Button>
        </Paper>
        <TableContainer
          component={Paper}
          elevation={3}
          style={{ width: table.getTotalSize() }}
        >
          <MUITable size="small" stickyHeader>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <ColumnHeader<T>
                      key={header.id}
                      header={header}
                      table={table}
                      tableColumnDragging={tableColumnDragging}
                      onDragStateChange={setTableColumnDragging}
                    />
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </MUITable>
          <TablePagination
            rowsPerPageOptions={PAGE_LIMITS}
            component="div"
            count={
              (manualControl
                ? count
                : table.getFilteredRowModel().rows.length) || -1
            }
            rowsPerPage={pagination.pageSize}
            page={pagination.pageIndex}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            showFirstButton
            showLastButton
          />
        </TableContainer>
      </Box>
    </Paper>
  );
}

export default MyTable;
