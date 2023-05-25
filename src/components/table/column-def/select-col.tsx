import type { ColumnHelper } from "@tanstack/react-table";

import { Checkbox } from "@mui/material";

interface SelectColProps<T> {
  columnHelper: ColumnHelper<T>;
}

function selectColDef<T>({ columnHelper }: SelectColProps<T>) {
  return columnHelper.display({
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
        onChange={table.getToggleAllPageRowsSelectedHandler()}
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
  });
}

export default selectColDef;
