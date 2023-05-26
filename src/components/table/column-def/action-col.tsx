import type { CellContext, ColumnHelper } from "@tanstack/react-table";

import TruncatedHeader from "./header/truncated-header";

interface ActionColProps<T> {
  columnHelper: ColumnHelper<T>;
  cell: (ctx: CellContext<T, unknown>) => React.ReactNode;
  size?: number;
}

function createActionColDef<T>({
  columnHelper,
  cell,
  size,
}: ActionColProps<T>) {
  return columnHelper.display({
    id: "actions",
    meta: { name: "Actions", draggable: false },
    size: size || 100,
    enableHiding: false,
    enableResizing: false,
    enableSorting: false,
    header: (props) => (
      <TruncatedHeader maxWidth={props.column.getSize()}>
        Actions
      </TruncatedHeader>
    ),
    cell,
  });
}

export default createActionColDef;
