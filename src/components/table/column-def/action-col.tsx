import type {
  CellContext,
  ColumnDef,
  HeaderContext,
} from "@tanstack/react-table";

import TruncatedHeader from "./header/truncated-header";

export interface ActionColProps<T> {
  cell: (ctx: CellContext<T, unknown>) => React.ReactNode;
  size?: number;
}

function createActionColDef<T>({
  cell,
  size,
}: ActionColProps<T>): ColumnDef<T> {
  return {
    id: "actions",
    meta: { name: "Actions", draggable: false },
    size: size || 100,
    enableHiding: false,
    enableResizing: false,
    enableSorting: false,
    header: (ctx: HeaderContext<T, unknown>) => (
      <TruncatedHeader maxWidth={ctx.column.getSize()}>Actions</TruncatedHeader>
    ),
    cell,
  };
}

export default createActionColDef;
