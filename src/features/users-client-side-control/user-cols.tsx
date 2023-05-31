import type { User } from "../../mocks/db";

import { Box, Button, Chip, Stack, Typography } from "@mui/material";

import createColumnDefinitions from "../../components/table/column-def";

const userColumns = createColumnDefinitions<User, string>({
  indexCol: true,
  selectCol: true,
  accessorCols: [
    {
      accessorKey: "fullName",
      header: "User",
      cell: (ctx) => (
        <Stack>
          <Box>
            <Typography
              variant="body1"
              sx={{ display: "inline-block", fontWeight: 700 }}
            >
              {ctx.getValue()}
            </Typography>
            {!ctx.row.original["active"] && (
              <Chip
                label="inactive"
                size="small"
                color="info"
                sx={{ display: "inline", ml: 1 }}
              />
            )}
          </Box>
          <Typography variant="body2">
            {ctx.row.original["username"]}
          </Typography>
          <Typography variant="caption" color="#777">
            {ctx.row.original["id"]}
          </Typography>
        </Stack>
      ),
      enableHiding: false,
      minSize: 150,
    },
    {
      accessorKey: "email",
      header: "E-mail",
      cell: (ctx) => (
        <Typography
          variant="body2"
          sx={{
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            maxWidth: ctx.column.getSize(),
          }}
        >
          {ctx.getValue()}
        </Typography>
      ),
    },
    {
      accessorKey: "group.name",
      header: "Group",
      cell: (ctx) => (
        <Stack>
          <Typography variant="body1">{ctx.getValue()}</Typography>
          <Typography variant="caption" color="#777">
            {ctx.row.original["group"]["id"]}
          </Typography>
        </Stack>
      ),
    },
    {
      accessorKey: "org.name",
      header: "Organization",
      cell: (ctx) => (
        <Stack>
          <Typography variant="body1">{ctx.getValue()}</Typography>
          <Typography variant="caption" color="#777">
            {ctx.row.original["org"]["id"]}
          </Typography>
        </Stack>
      ),
    },
    {
      accessorKey: "remark",
      header: "Remark",
      cell: (ctx) => <Typography variant="body2">{ctx.getValue()}</Typography>,
      enableSorting: false,
    },
  ],
  rowActions: (ctx) => (
    <Button onClick={() => console.log(JSON.stringify(ctx.row))}>hello</Button>
  ),
});

export default userColumns;
