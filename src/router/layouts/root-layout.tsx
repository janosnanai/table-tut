import { Link as RouterLink, Outlet } from "@tanstack/router";
import { Box, Button, ButtonGroup, Divider, Paper } from "@mui/material";

function RootLayout() {
  return (
    <Paper>
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <ButtonGroup>
          <Button component={RouterLink} to="/" variant="contained">
            home
          </Button>
          <Button component={RouterLink} to="/client-side" variant="contained">
            client-side data control
          </Button>
          <Button component={RouterLink} to="/server-side" variant="contained">
            server-side data control
          </Button>
        </ButtonGroup>
      </Box>
      <Divider />
      <Outlet />
    </Paper>
  );
}

export default RootLayout;
