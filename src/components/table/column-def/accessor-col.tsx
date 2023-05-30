import type {
  CellContext,
  ColumnDef,
  HeaderContext,
} from "@tanstack/react-table";

import TruncatedHeader from "./header/truncated-header";

export interface AccessorColProps<TData, TValue> {
  accessorKey: string;
  header: string;
  cell: (ctx: CellContext<TData, TValue>) => React.ReactNode;
  enableGlobalFilter?: boolean;
  name?: string;
  id?: string;
  draggable?: boolean;
  enableHiding?: boolean;
  enableResizing?: boolean;
  enableSorting?: boolean;
  minSize?: number;
  size?: number;
  maxSize?: number;
}

function createAccessorColDef<TData, TValue>({
  accessorKey,
  header,
  cell,
  enableGlobalFilter = true,
  name,
  id,
  draggable = true,
  enableHiding = true,
  enableResizing = true,
  enableSorting = true,
  minSize = 20,
  size,
  maxSize = Number.MAX_SAFE_INTEGER,
}: AccessorColProps<TData, TValue>): ColumnDef<TData, TValue> {
  return {
    accessorKey,
    header: (ctx: HeaderContext<TData, TValue>) => (
      <TruncatedHeader maxWidth={ctx.column.getSize()}>
        {header}
      </TruncatedHeader>
    ),
    cell,
    enableGlobalFilter,
    meta: { name: name || header, draggable },
    id: id || accessorKey,
    enableHiding,
    enableResizing,
    enableSorting,
    minSize,
    size,
    maxSize,
  };
}

export default createAccessorColDef;
