import type { ColumnHelper } from "@tanstack/react-table";

interface IndexColProps<T> {
  columnHelper: ColumnHelper<T>;
}

function indexColDef<T>({ columnHelper }: IndexColProps<T>) {
  return columnHelper.display({
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
  });
}

export default indexColDef;
