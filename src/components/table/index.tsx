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
  Stack,
  Box,
} from "@mui/material";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

import useGetUsersQuery from "../../hooks/useGetUsersQuery";

const columnHelper = createColumnHelper<User>();

const columns = [
  columnHelper.accessor("fullName", {
    header: "User",
    cell: (props) => (
      <Box sx={{ display: "flex", gap: 3 }}>
        <Stack>
          <Typography>{props.getValue()}</Typography>
          <span>{props.row.original["username"]}</span>
          <span>{props.row.original["id"]}</span>
        </Stack>
        {!props.row.original["active"] && (
          <Chip label="inactive" size="small" color="default" />
        )}
      </Box>
    ),
  }),
  columnHelper.accessor("email", {
    header: "E-mail",
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor("group.name", {
    header: "Group",
    cell: (props) => (
      <Stack>
        <span>{props.getValue()}</span>
        <span>{props.row.original["group"]["id"]}</span>
      </Stack>
    ),
  }),
  columnHelper.accessor("org.name", {
    header: "Organization",
    cell: (props) => (
      <Stack>
        <span>{props.getValue()}</span>
        <span>{props.row.original["org"]["id"]}</span>
      </Stack>
    ),
  }),
  columnHelper.accessor("remark", {
    header: "Remark",
    cell: (props) => props.getValue(),
  }),
];

const initialFilter = {
  page: 0,
  limit: PAGE_LIMITS[0],
};

function UsersTable() {
  const [filter, setFilter] = useState(initialFilter);

  const { data: usersData } = useGetUsersQuery(filter);

  const table = useReactTable({
    data: usersData?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  function handlePageChange(_e: unknown, update: number) {
    setFilter((prev) => ({ ...prev, page: update }));
  }

  function handleRowsPerPageChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const update = parseInt(e.target.value);
    setFilter((prev) => ({ ...prev, page: 0, limit: update }));
  }

  if (!usersData) return <div>{":(..."}</div>;

  return (
    <Box>
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
          count={usersData?.count || 0}
          rowsPerPage={filter.limit}
          page={filter.page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </TableContainer>
    </Box>
  );
}

export default UsersTable;
