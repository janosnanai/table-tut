import type { CellContext } from "@tanstack/react-table";

function createIndexColDef<T>() {
  return {
    id: "index",
    meta: { name: "Index", draggable: false },
    size: 50,
    enableHiding: false,
    enableResizing: false,
    enableSorting: false,
    header: "#",
    cell: (ctx: CellContext<T, unknown>) =>
      ctx.row.index +
      1 +
      ctx.table.getState().pagination.pageIndex *
        ctx.table.getState().pagination.pageSize,
  };
}

export default createIndexColDef;
