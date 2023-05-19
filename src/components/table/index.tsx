import type { ChangeEvent } from "react";
import type {
  ColumnOrderState,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  Header,
  Column,
  Table,
} from "@tanstack/react-table";
import type { User } from "../../mocks/db";

import { useState } from "react";
import {
  Table as MUITable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Typography,
  Paper,
  Chip,
  Divider,
  Stack,
  Box,
  Container,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
} from "@mui/material";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useDrag, useDrop } from "react-dnd";

import useGetUsersQuery from "../../hooks/use-get-users-query";
import { useTimeout } from "../../hooks/use-timeout";
import { PAGE_LIMITS, SORT_DIRECTION } from "../../config";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends unknown, TValue> {
    name?: string;
  }
}

const columnHelper = createColumnHelper<User>();

const columns = [
  columnHelper.display({
    id: "select",
    meta: { name: "Select" },
    enableHiding: false,
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        indeterminate={row.getIsSomeSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  }),
  columnHelper.display({
    id: "index",
    meta: { name: "Index" },
    enableHiding: false,
    enableSorting: false,
    header: "#",
    cell: ({ row, table }) =>
      row.index +
      1 +
      table.getState().pagination.pageIndex *
        table.getState().pagination.pageSize,
  }),
  columnHelper.accessor("fullName", {
    id: "fullName",
    meta: { name: "User" },
    enableHiding: false,
    enableSorting: true,
    enableGlobalFilter: true,
    header: "User",
    cell: (props) => (
      <Stack>
        <Box>
          <Typography
            variant="body1"
            sx={{ display: "inline-block", fontWeight: 700 }}
          >
            {props.getValue()}
          </Typography>
          {!props.row.original["active"] && (
            <Chip
              label="inactive"
              size="small"
              color="info"
              sx={{ display: "inline", ml: 1 }}
            />
          )}
        </Box>
        <Typography variant="body2">
          {props.row.original["username"]}
        </Typography>
        <Typography variant="caption" color="#777">
          {props.row.original["id"]}
        </Typography>
      </Stack>
    ),
  }),
  columnHelper.accessor("email", {
    id: "email",
    meta: { name: "E-mail" },
    enableHiding: true,
    enableSorting: true,
    enableGlobalFilter: true,
    header: "E-mail",
    cell: (props) => (
      <Typography variant="body2">{props.getValue()}</Typography>
    ),
  }),
  columnHelper.accessor("group.name", {
    id: "group.name",
    meta: { name: "Group" },
    enableHiding: true,
    enableSorting: true,
    header: "Group",
    cell: (props) => (
      <Stack>
        <Typography variant="body1">{props.getValue()}</Typography>
        <Typography variant="caption" color="#777">
          {props.row.original["group"]["id"]}
        </Typography>
      </Stack>
    ),
  }),
  columnHelper.accessor("org.name", {
    id: "org.name",
    meta: { name: "Organization" },
    enableHiding: true,
    enableSorting: true,
    enableGlobalFilter: true,
    header: "Organization",
    cell: (props) => (
      <Stack>
        <Typography variant="body1">{props.getValue()}</Typography>
        <Typography variant="caption" color="#777">
          {props.row.original["org"]["id"]}
        </Typography>
      </Stack>
    ),
  }),
  columnHelper.accessor("remark", {
    id: "remark",
    meta: { name: "Remark" },
    enableHiding: true,
    enableSorting: false,
    enableGlobalFilter: false,
    header: "Remark",
    cell: (props) => (
      <Typography variant="body2">{props.getValue()}</Typography>
    ),
  }),
  columnHelper.display({
    id: "actions",
    meta: { name: "Actions" },
    enableHiding: false,
    enableSorting: false,
    header: "Actions",
    cell: (props) => (
      <Button onClick={() => console.log(JSON.stringify(props.row))}>
        hello
      </Button>
    ),
  }),
];

const initialPagination = {
  pageIndex: 0,
  pageSize: PAGE_LIMITS[0],
};

const defaultData = [] as User[];

interface ColumnHeaderProps<T> {
  header: Header<T, unknown>;
  table: Table<T>;
  tableColumnDragging: string | null;
  onDragStateChange: (update: string | null) => void;
}

function ColumnHeader({
  header,
  table,
  tableColumnDragging,
  onDragStateChange,
}: ColumnHeaderProps<User>) {
  const { getState, setColumnOrder } = table;
  const { columnOrder } = getState();
  const { column } = header;

  const [, dropRef] = useDrop({
    accept: "column",
    drop: (draggedColumn: Column<User>) => {
      const newColumnOrder = reorderColumns(
        draggedColumn.id,
        column.id,
        columnOrder
      );
      setColumnOrder(newColumnOrder);
    },
  });

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    item: () => column,
    type: "column",
    end: handleDragEnd,
  });

  function reorderColumns(
    draggedColumnId: string,
    targetColumnId: string,
    columnOrder: string[]
  ): ColumnOrderState {
    columnOrder.splice(
      columnOrder.indexOf(targetColumnId),
      0,
      columnOrder.splice(columnOrder.indexOf(draggedColumnId), 1)[0]
    );
    return [...columnOrder];
  }

  function handleDragStart() {
    onDragStateChange(header.id);
  }

  function handleDragEnd() {
    onDragStateChange(null);
  }

  return (
    <TableCell
      onDrag={handleDragStart}
      ref={dragRef}
      sx={{ position: "relative" }}
    >
      <div ref={previewRef}>
        <Stack direction="row">
          {flexRender(column.columnDef.header, header.getContext())}
          {column.getCanSort() && (
            <TableSortLabel
              active={!!column.getIsSorted()}
              direction={column.getIsSorted() || SORT_DIRECTION.ASC}
              onClick={column.getToggleSortingHandler()}
            />
          )}
        </Stack>
      </div>
      {tableColumnDragging !== null && tableColumnDragging !== header.id && (
        <div ref={dropRef} style={{ position: "absolute", inset: 0 }}></div>
      )}
    </TableCell>
  );
}

function UsersTable() {
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    getDefaultColumnOrder()
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [globalFilterInput, setGlobalFilterInput] = useState("");
  const [pagination, setPagination] =
    useState<PaginationState>(initialPagination);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [tableColumnDragging, setTableColumnDragging] = useState<string | null>(
    null
  );

  const { startTimeout, stopTimeout } = useTimeout(() =>
    setGlobalFilter(globalFilterInput)
  );

  const { data: usersData } = useGetUsersQuery({
    pagination,
    sorting: sorting[0],
    filter: { global: globalFilter },
  });

  const table = useReactTable({
    data: usersData?.data || defaultData,
    columns,
    pageCount: usersData?.pagination.count,
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
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    enableRowSelection: true,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    enableMultiRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
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
    <Box sx={{ background: "#ddd" }}>
      <Container>
        <Paper sx={{ display: "inline-block", m: 3, py: 1, px: 3 }}>
          <Stack>
            <FormControlLabel
              control={
                <Checkbox
                  checked={table.getIsAllColumnsVisible()}
                  indeterminate={
                    table.getIsSomeColumnsVisible() &&
                    !table.getIsAllColumnsVisible()
                  }
                  onChange={table.getToggleAllColumnsVisibilityHandler()}
                />
              }
              label="column visibility"
            />
            <Divider orientation="horizontal" />
            {table.getAllLeafColumns().map((col) => {
              return (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={col.getIsVisible()}
                      disabled={!col.getCanHide()}
                      onChange={col.getToggleVisibilityHandler()}
                    />
                  }
                  label={col.columnDef.meta?.name || col.id}
                  key={col.id}
                />
              );
            })}
          </Stack>
          <TextField
            onChange={handleFilterChange}
            value={globalFilterInput}
            placeholder="type searchterm..."
          />
        </Paper>
        <p>{JSON.stringify(tableColumnDragging)}</p>
        <p>{JSON.stringify(columnOrder)}</p>
        <TableContainer component={Paper} elevation={3}>
          <MUITable size="small" stickyHeader>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <ColumnHeader
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
                    <TableCell key={cell.id}>
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
            count={usersData?.pagination.count || 0}
            rowsPerPage={pagination.pageSize}
            page={pagination.pageIndex}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            showFirstButton
            showLastButton
          />
        </TableContainer>
      </Container>
    </Box>
  );
}

export default UsersTable;
