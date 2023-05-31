import { RouterProvider } from "@tanstack/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { CssBaseline } from "@mui/material";

import router from "./router";

const queryClient = new QueryClient();

function App() {
  return (
    <main>
      <QueryClientProvider client={queryClient}>
        <DndProvider backend={HTML5Backend}>
          <CssBaseline />
          <ReactQueryDevtools />
          <RouterProvider router={router} />
        </DndProvider>
      </QueryClientProvider>
    </main>
  );
}

export default App;
