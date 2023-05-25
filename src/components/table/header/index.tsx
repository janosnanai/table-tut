import type {
  Column,
  ColumnOrderState,
  Header,
  Table,
} from "@tanstack/react-table";

import { Divider, Stack, TableCell, TableSortLabel } from "@mui/material";
import { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { flexRender } from "@tanstack/react-table";

import { SORT_DIRECTION } from "../../../config";

interface ColumnHeaderProps<T> {
  header: Header<T, unknown>;
  table: Table<T>;
  tableColumnDragging: string | null;
  onDragStateChange: (update: string | null) => void;
}

function ColumnHeader<T>({
  header,
  table,
  tableColumnDragging,
  onDragStateChange,
}: ColumnHeaderProps<T>) {
  const { getState, setColumnOrder } = table;
  const { columnOrder } = getState();
  const { column } = header;

  const [resizable, setResizable] = useState(false);
  const [draggable, setDraggable] = useState(
    header.column.columnDef.meta?.draggable || false
  );

  const [, dropRef] = useDrop({
    accept: "column",
    drop: (draggedColumn: Column<T>) => {
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

export default ColumnHeader;
