import type {
  CellContext,
  ColumnDef,
  HeaderContext,
} from "@tanstack/react-table";

import { Checkbox } from "@mui/material";

function createSelectColDef<T>(): ColumnDef<T> {
  return {
    id: "select",
    meta: { name: "Select", draggable: false },
    size: 50,
    enableHiding: false,
    enableResizing: false,
    enableSorting: false,
    header: (ctx: HeaderContext<T, unknown>) => (
      <Checkbox
        checked={ctx.table.getIsAllPageRowsSelected()}
        indeterminate={ctx.table.getIsSomePageRowsSelected()}
        onChange={ctx.table.getToggleAllPageRowsSelectedHandler()}
      />
    ),
    cell: (ctx: CellContext<T, unknown>) => (
      <Checkbox
        checked={ctx.row.getIsSelected()}
        disabled={!ctx.row.getCanSelect()}
        indeterminate={ctx.row.getIsSomeSelected()}
        onChange={ctx.row.getToggleSelectedHandler()}
      />
    ),
  };
}

export default createSelectColDef;
