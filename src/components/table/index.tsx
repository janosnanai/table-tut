// TODO: asc/desc toggle into 2 buttons, advanced search menu, group actions for page and for every(!) result, a11y and i18n
import type { ChangeEvent } from "react";
import type {
  ColumnOrderState,
  ColumnResizeMode,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  Updater,
} from "@tanstack/react-table";
import type { User } from "../../mocks/db";

import { useReducer, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table as MUITable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
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

import createAccessorColDef from "./column-def/accessor-col";
import createSelectColDef from "./column-def/select-col";
import createIndexColDef from "./column-def/index-col";
import createActionColDef from "./column-def/action-col";
import ColumnHeader from "./column-header";
import ViewMenu from "./view-menu";
import useGetUsersQuery from "../../hooks/use-get-users-query";
import { useTimeout } from "../../hooks/use-timeout";
import { PAGE_LIMITS } from "../../config";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends unknown, TValue> {
    name?: string;
    draggable?: boolean;
  }
}

const columns = [
  createSelectColDef<User>(),
  createIndexColDef<User>(),
  createAccessorColDef<User, string>({
    accessorKey: "fullName",
    header: "User",
    cell: (ctx) => (
      <Stack>
        <Box>
          <Typography
            variant="body1"
            sx={{ display: "inline-block", fontWeight: 700 }}
          >
            {ctx.getValue()}
          </Typography>
          {!ctx.row.original["active"] && (
            <Chip
              label="inactive"
              size="small"
              color="info"
              sx={{ display: "inline", ml: 1 }}
            />
          )}
        </Box>
        <Typography variant="body2">{ctx.row.original["username"]}</Typography>
        <Typography variant="caption" color="#777">
          {ctx.row.original["id"]}
        </Typography>
      </Stack>
    ),
    enableHiding: false,
    minSize: 150,
  }),
  createAccessorColDef<User, string>({
    accessorKey: "email",
    header: "E-mail",
    cell: (ctx) => (
      <Typography
        variant="body2"
        sx={{
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
          maxWidth: ctx.column.getSize(),
        }}
      >
        {ctx.getValue()}
      </Typography>
    ),
  }),
  createAccessorColDef<User, string>({
    accessorKey: "group.name",
    header: "Group",
    cell: (ctx) => (
      <Stack>
        <Typography variant="body1">{ctx.getValue()}</Typography>
        <Typography variant="caption" color="#777">
          {ctx.row.original["group"]["id"]}
        </Typography>
      </Stack>
    ),
  }),
  createAccessorColDef<User, string>({
    accessorKey: "org.name",
    header: "Organization",
    cell: (ctx) => (
      <Stack>
        <Typography variant="body1">{ctx.getValue()}</Typography>
        <Typography variant="caption" color="#777">
          {ctx.row.original["org"]["id"]}
        </Typography>
      </Stack>
    ),
  }),
  createAccessorColDef<User, string>({
    accessorKey: "remark",
    header: "Remark",
    cell: (ctx) => <Typography variant="body2">{ctx.getValue()}</Typography>,
    enableSorting: false,
  }),
  createActionColDef<User>({
    cell: (ctx) => (
      <Button onClick={() => console.log(JSON.stringify(ctx.row))}>
        hello
      </Button>
    ),
  }),
];

const initialPagination = {
  pageIndex: 0,
  pageSize: PAGE_LIMITS[0],
} as PaginationState;

const defaultData = [] as User[];

interface DataOptionsState {
  pagination: PaginationState;
  sorting: [];
  filter: { global: string };
}

const initialDataOptions = {
  pagination: initialPagination,
  sorting: [],
  filter: { global: "" },
} as DataOptionsState;

const enum DataOptionsActionType {
  SET_GLOBAL_FILTER = "SET_GLOBAL_FILTER",
  SET_GLOBAL_FILTER_SAFE_PAGINATION = "SET_GLOBAL_FILTER_SAFE_PAGINATION",
  SET_PAGINATION = "SET_PAGINATION",
  SET_SORTING = "SET_SORTING",
}

interface dataOptionsAction {
  type: DataOptionsActionType;
  payload: any;
}

function dataOptionsReducer(
  state: DataOptionsState,
  action: dataOptionsAction
): DataOptionsState {
  switch (action.type) {
    case DataOptionsActionType.SET_GLOBAL_FILTER: {
      return {
        ...state,
        filter: { ...state.filter, global: action.payload },
      };
    }
    case DataOptionsActionType.SET_GLOBAL_FILTER_SAFE_PAGINATION: {
      return {
        ...state,
        filter: { ...state.filter, global: action.payload },
        pagination: { ...state.pagination, pageIndex: 0 },
      };
    }
    case DataOptionsActionType.SET_PAGINATION: {
      return {
        ...state,
        pagination: { ...action.payload },
      };
    }
    case DataOptionsActionType.SET_SORTING: {
      return { ...state, sorting: action.payload };
    }
    default:
      throw Error("Unknown action: " + action.type);
  }
}

function MyTable() {
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    getDefaultColumnOrder()
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilterInput, setGlobalFilterInput] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [tableColumnDragging, setTableColumnDragging] = useState<string | null>(
    null
  );

  const [dataOptions, dispatchDataOptionsAction] = useReducer(
    dataOptionsReducer,
    initialDataOptions
  );

  function setGlobalFilter(update: string) {
    dispatchDataOptionsAction({
      type: DataOptionsActionType.SET_GLOBAL_FILTER,
      payload: update,
    });
  }

  function setPagination(updaterFn: Updater<PaginationState>) {
    const prev = { ...dataOptions.pagination };
    const update = functionalUpdate(updaterFn, prev);
    dispatchDataOptionsAction({
      type: DataOptionsActionType.SET_PAGINATION,
      payload: update,
    });
  }

  function setSorting(updaterFn: Updater<SortingState>) {
    const prev = [...dataOptions.sorting];
    const update = functionalUpdate(updaterFn, prev);
    dispatchDataOptionsAction({
      type: DataOptionsActionType.SET_SORTING,
      payload: update,
    });
  }

  const columnResizeMode: ColumnResizeMode = "onChange";

  const { startTimeout, stopTimeout } = useTimeout(() => {
    dispatchDataOptionsAction({
      type: DataOptionsActionType.SET_GLOBAL_FILTER_SAFE_PAGINATION,
      payload: globalFilterInput,
    });
  });

  const { data: usersData } = useGetUsersQuery(dataOptions);

  const table = useReactTable({
    data: usersData?.data || defaultData,
    columns,
    columnResizeMode,
    pageCount: usersData?.pagination.count,
    state: {
      columnOrder,
      columnVisibility,
      globalFilter: dataOptions.filter.global,
      pagination: dataOptions.pagination,
      rowSelection,
      sorting: dataOptions.sorting,
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
          <ViewMenu<User> table={table} />
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
                    <ColumnHeader<User>
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
            count={usersData?.pagination.count || -1}
            rowsPerPage={dataOptions.pagination.pageSize}
            page={dataOptions.pagination.pageIndex}
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
