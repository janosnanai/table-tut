import type { User } from "../../mocks/db";

import { Box, Button, Chip, Stack, Typography } from "@mui/material";

import createAccessorColDef from "../../components/table/column-def/accessor-col";
import createActionColDef from "../../components/table/column-def/action-col";
import createSelectColDef from "../../components/table/column-def/select-col";
import createIndexColDef from "../../components/table/column-def/index-col";

// TODO make more abstract columns builder
const userColumns = [
  createSelectColDef<User>(),
  createIndexColDef<User>(),
  createAccessorColDef<User, string>({
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
        <Typography variant="body2">{ctx.row.original["username"]}</Typography>
        <Typography variant="caption" color="#777">
          {ctx.row.original["id"]}
        </Typography>
      </Stack>
    ),
    enableHiding: false,
    minSize: 150,
  }),
  createAccessorColDef<User, string>({
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
  }),
  createAccessorColDef<User, string>({
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
  }),
  createAccessorColDef<User, string>({
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
  }),
  createAccessorColDef<User, string>({
    accessorKey: "remark",
    header: "Remark",
    cell: (ctx) => <Typography variant="body2">{ctx.getValue()}</Typography>,
    enableSorting: false,
  }),
  createActionColDef<User>({
    cell: (ctx) => (
      <Button onClick={() => console.log(JSON.stringify(ctx.row))}>
        hello
      </Button>
    ),
  }),
];

export default userColumns;
