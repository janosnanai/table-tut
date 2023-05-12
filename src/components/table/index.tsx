import type { ChangeEvent } from "react";
import type { User } from "../../mocks/db";

import { useState } from "react";

import { PAGE_LIMITS } from "../../config";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Paper,
  Chip,
  Divider,
  Stack,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";

import useGetUsersQuery from "../../hooks/useGetUsersQuery";

const columnHelper = createColumnHelper<User>();

const columns = [
  columnHelper.display({
    id: "select",
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
    header: "#",
    cell: ({ row, table }) =>
      row.index +
      1 +
      table.getState().pagination.pageIndex *
        table.getState().pagination.pageSize,
  }),
  columnHelper.accessor("fullName", {
    header: "User",
    cell: (props) => (
      <Stack>
        <Box>
          <Typography variant="body1" sx={{ display: "inline-block" }}>
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
    cell: (props) => (
      <Typography variant="body2">{props.getValue()}</Typography>
    ),
  }),
  columnHelper.accessor("group.name", {
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
    header: "Remark",
    cell: (props) => (
      <Typography variant="body2">{props.getValue()}</Typography>
    ),
  }),
  columnHelper.display({
    id: "actions",
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
  const [pagination, setPagination] = useState(initialPagination);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({});

  const { data: usersData } = useGetUsersQuery(pagination);

  const table = useReactTable({
    data: usersData?.data || defaultData,
    columns,
    pageCount: usersData?.pagination.count,
    state: {
      pagination,
      rowSelection,
      columnVisibility,
    },
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
  });

  function handlePageChange(_e: unknown, update: number) {
    table.setPageIndex(update);
  }

  function handleRowsPerPageChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const update = parseInt(e.target.value);
    table.setPageSize(update);
  }

  if (!usersData) return <div>{":(..."}</div>;

  return (
    <Box>
      <p>{JSON.stringify(table.getState())}</p>
      <Paper sx={{ display: "inline-block", m: 3, py: 1, px: 3 }}>
        <Stack>
          <FormControlLabel
            control={
              <Checkbox
                checked={table.getIsAllColumnsVisible()}
                indeterminate={table.getIsSomeColumnsVisible()}
              />
            }
            label="column visibility"
          />
          <Divider orientation="horizontal" />
          {table.getAllLeafColumns().map((col) => {
            return (
              <FormControlLabel
                control={<Checkbox checked={col.getIsVisible()} />}
                label={col.id}
              />
            );
          })}
        </Stack>
      </Paper>
      <h1>users</h1>
      <TableContainer component={Paper} elevation={3}>
        <Table stickyHeader>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
    </Box>
  );
}

export default UsersTable;
