import type { CellContext } from "@tanstack/react-table";
import type { AccessorColProps } from "./accessor-col";

import createAccessorColDef from "./accessor-col";
import createActionColDef from "./action-col";
import createIndexColDef from "./index-col";
import createSelectColDef from "./select-col";

interface ColumnDefinitionsProps<TData, TValue> {
  accessorCols: AccessorColProps<TData, TValue>[];
  indexCol?: boolean;
  selectCol?: boolean;
  rowActions?: (ctx: CellContext<TData, unknown>) => React.ReactNode;
}

function createColumnDefinitions<TData, TValue>({
  accessorCols,
  indexCol,
  selectCol,
  rowActions,
}: ColumnDefinitionsProps<TData, TValue>) {
  const accessorColDefs = accessorCols.map((colDef) =>
    createAccessorColDef<TData, TValue>(colDef)
  );

  const columnDefinitions = [];

  if (selectCol) {
    const selectColDef = createSelectColDef<TData>();
    columnDefinitions.push(selectColDef);
  }

  if (indexCol) {
    const indexColDef = createIndexColDef<TData>();
    columnDefinitions.push(indexColDef);
  }

  columnDefinitions.push(accessorColDefs);

  if (rowActions) {
    const actionColDef = createActionColDef<TData>({ cell: rowActions });
    columnDefinitions.push(actionColDef);
  }
}

export default createColumnDefinitions;
