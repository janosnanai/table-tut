import type { ChangeEvent } from "react";
import type {
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import type { User } from "../../mocks/db";

import { useState } from "react";
import {
  Table,
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
    header: "User",
    meta: { name: "User" },
    enableHiding: false,
    enableSorting: true,
    enableGlobalFilter: true,
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
    header: "E-mail",
    meta: { name: "E-mail" },
    enableHiding: true,
    enableSorting: true,
    enableGlobalFilter: true,
    cell: (props) => (
      <Typography variant="body2">{props.getValue()}</Typography>
    ),
  }),
  columnHelper.accessor("group.name", {
    header: "Group",
    meta: { name: "Group" },
    enableHiding: true,
    enableSorting: true,
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
    header: "Organization",
    meta: { name: "Organization" },
    enableHiding: true,
    enableSorting: true,
    enableGlobalFilter: true,
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
    header: "Remark",
    meta: { name: "Remark" },
    enableHiding: true,
    enableSorting: false,
    enableGlobalFilter: false,
    cell: (props) => (
      <Typography variant="body2">{props.getValue()}</Typography>
    ),
  }),
  columnHelper.display({
    header: "Actions",
    meta: { name: "Actions" },
    enableHiding: false,
    enableSorting: false,
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

function UsersTable() {
  const [pagination, setPagination] =
    useState<PaginationState>(initialPagination);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [globalFilterInput, setGlobalFilterInput] = useState("");

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
      columnVisibility,
      globalFilter,
      pagination,
      rowSelection,
      sorting,
    },
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

  // if (!usersData) return <div>{":(..."}</div>;

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
        <TableContainer component={Paper} elevation={3}>
          <Table size="small" stickyHeader>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell key={header.id}>
                      <Stack direction="row">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <TableSortLabel
                            active={!!header.column.getIsSorted()}
                            direction={
                              header.column.getIsSorted() || SORT_DIRECTION.ASC
                            }
                            onClick={header.column.getToggleSortingHandler()}
                          />
                        )}
                      </Stack>
                    </TableCell>
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
          </Table>
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
