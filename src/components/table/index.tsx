import type { ChangeEvent } from "react";
import type {
  ColumnOrderState,
  ColumnResizeMode,
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
  TableSortLabel,
  TextField,
  Typography,
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
    draggable?: boolean;
  }
}

const columnHelper = createColumnHelper<User>();

const columns = [
  columnHelper.display({
    id: "select",
    meta: { name: "Select", draggable: false },
    size: 50,
    enableHiding: false,
    enableResizing: false,
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
    meta: { name: "Index", draggable: false },
    size: 50,
    enableHiding: false,
    enableResizing: false,
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
  columnHelper.display({
    id: "actions",
    meta: { name: "Actions", draggable: false },
    minSize: 100,
    enableHiding: false,
    enableResizing: false,
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

interface TruncatedHeaderProps {
  maxWidth: number;
  children: React.ReactNode;
}

function TruncatedHeader({ maxWidth, children }: TruncatedHeaderProps) {
  return (
    <Typography
      variant="body1"
      sx={{
        textOverflow: "ellipsis",
        overflow: "hidden",
        whiteSpace: "nowrap",
        maxWidth,
      }}
    >
      {children}
    </Typography>
  );
}

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

  const [resizable, setResizable] = useState(false);
  const [draggable, setDraggable] = useState(
    header.column.columnDef.meta?.draggable || false
  );

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
    canDrop: () => header.column.columnDef.meta?.draggable || false,
  });

  const [_, dragRef, previewRef] = useDrag({
    collect: (monitor) => ({
      isDragging: header.column.columnDef.meta?.draggable
        ? monitor.isDragging()
        : null,
    }),
    item: () => (header.column.columnDef.meta?.draggable ? column : null),
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

  // TODO: make this a state-machine
  function handleDragStart() {
    onDragStateChange(header.id);
  }

  function handleDragEnd() {
    onDragStateChange(null);
  }

  function handleMouseOverResizer() {
    if (!header.column.getCanResize()) return;
    setDraggable(false);
    setResizable(true);
  }

  function handleMouseLeaveResizer() {
    if (!header.column.getCanResize()) return;
    setDraggable(header.column.columnDef.meta?.draggable || false);
    setResizable(false);
  }

  return (
    <TableCell
      draggable={draggable}
      onDrag={handleDragStart}
      ref={dragRef}
      sx={{
        position: "relative",
      }}
      style={{ maxWidth: header.getSize() }}
    >
      {/* <div style={{ fontSize: "9px" }}>
        <div>draggable: {JSON.stringify(draggable)}</div>
        <div>resizable: {JSON.stringify(resizable)}</div>
        <div>size: {header.column.getSize()}</div>
      </div> */}
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
        {header.column.getCanResize() && (
          <Divider
            onMouseDown={header.getResizeHandler()}
            onMouseOver={handleMouseOverResizer}
            onMouseLeave={handleMouseLeaveResizer}
            component="div"
            orientation="vertical"
            light={!resizable}
            sx={{
              position: "absolute",
              height: "60%",
              top: "20%",
              right: 0,
              borderRightWidth: "4px",
              cursor: "col-resize",
              marginX: 1,
              userSelect: "none",
            }}
          />
        )}
      </div>
      {tableColumnDragging !== null && tableColumnDragging !== header.id && (
        <div ref={dropRef} style={{ position: "absolute", inset: 0 }}></div>
      )}
    </TableCell>
  );
}

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

  const columnResizeMode: ColumnResizeMode = "onChange";

  const { startTimeout, stopTimeout } = useTimeout(() =>
    // TODO: merge pagination and filters into one config object
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
    columnResizeMode,
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
        {/* <div>dragging: {JSON.stringify(tableColumnDragging)}</div>
        <div>cols order:{JSON.stringify(columnOrder)}</div>
      <div>size:{JSON.stringify(table.getTotalSize())}</div> */}
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
          {/*TODO: make this shit error-free (warning on from-to label if no server data received yet...)*/}
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
    </Paper>
  );
}

export default UsersTable;
