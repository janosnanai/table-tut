import type { Table } from "@tanstack/react-table";

import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Popover,
  Stack,
} from "@mui/material";

interface ViewMenuProps<T> {
  table: Table<T>;
}

function ViewMenu<T>({ table }: ViewMenuProps<T>) {
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
        View
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

export default ViewMenu;
