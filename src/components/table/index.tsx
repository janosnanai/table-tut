// TODO: asc/desc toggle into 2 buttons, advanced search menu, group actions for page and for every(!) result, a11y and i18n
import type { ChangeEvent } from "react";
import type {
  ColumnOrderState,
  ColumnResizeMode,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  Table,
  Updater,
} from "@tanstack/react-table";
import type { User } from "../../mocks/db";

import { useReducer, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Paper,
  Popover,
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
  createColumnHelper,
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import selectColDef from "./column-def/select-col";
import indexColDef from "./column-def/index-col";
import createActionColDef from "./column-def/action-col";
import TruncatedHeader from "./column-def/header/truncated-header";
import ColumnHeader from "./column-header";
import useGetUsersQuery from "../../hooks/use-get-users-query";
import { useTimeout } from "../../hooks/use-timeout";
import { PAGE_LIMITS } from "../../config";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends unknown, TValue> {
    name?: string;
    draggable?: boolean;
  }
}

const columnHelper = createColumnHelper<User>();

const columns = [
  selectColDef<User>(),
  indexColDef<User>(),
  columnHelper.accessor("fullName", {
    id: "fullName",
    meta: { name: "User", draggable: true },
    minSize: 150,
    enableHiding: false,
    enableResizing: true,
    enableSorting: true,
    enableGlobalFilter: true,
    header: (props) => (
      <TruncatedHeader maxWidth={props.column.getSize()}>User</TruncatedHeader>
    ),
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
    meta: { name: "E-mail", draggable: true },
    enableHiding: true,
    enableResizing: true,
    enableSorting: true,
    enableGlobalFilter: true,
    header: (props) => (
      <TruncatedHeader maxWidth={props.column.getSize()}>
        E-mail
      </TruncatedHeader>
    ),
    cell: (props) => (
      <Typography
        variant="body2"
        sx={{
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
          maxWidth: props.column.getSize(),
        }}
      >
        {props.getValue()}
      </Typography>
    ),
  }),
  columnHelper.accessor("group.name", {
    id: "group.name",
    meta: { name: "Group", draggable: true },
    enableHiding: true,
    enableResizing: true,
    enableSorting: true,
    header: (props) => (
      <TruncatedHeader maxWidth={props.column.getSize()}>Group</TruncatedHeader>
    ),
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
    meta: { name: "Organization", draggable: true },
    enableHiding: true,
    enableResizing: true,
    enableSorting: true,
    enableGlobalFilter: true,
    header: (props) => (
      <TruncatedHeader maxWidth={props.column.getSize()}>
        Organization
      </TruncatedHeader>
    ),
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
    meta: { name: "Remark", draggable: true },
    enableHiding: true,
    enableResizing: true,
    enableSorting: false,
    enableGlobalFilter: false,
    header: (props) => (
      <TruncatedHeader maxWidth={props.column.getSize()}>
        Remark
      </TruncatedHeader>
    ),
    cell: (props) => (
      <Typography variant="body2">{props.getValue()}</Typography>
    ),
  }),
  createActionColDef<User>({
    cell: (ctx) => (
      <Button onClick={() => console.log(JSON.stringify(ctx.row))}>
        hello
      </Button>
    ),
  }),
];

interface VisibilityMenuProps<T> {
  table: Table<T>;
}

function VisibilityMenu({ table }: VisibilityMenuProps<User>) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(e.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  const isOpen = !!anchorEl;

  return (
    <>
      <Button onClick={handleClick} variant="contained">
        columns
      </Button>
      <Popover
        open={isOpen}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Box sx={{ py: 1, px: 3 }}>
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
        </Box>
      </Popover>
    </>
  );
}

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

function UsersTable() {
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
          <VisibilityMenu table={table} />
          <Button variant="contained" onClick={resetColumnOrder}>
            reset order
          </Button>
        </Paper>
        <p>{JSON.stringify(table.getState().rowSelection)}</p>
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

export default UsersTable;
