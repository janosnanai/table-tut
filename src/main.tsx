import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { CssBaseline } from "@mui/material";

import App from "./app.tsx";
import { MODE } from "./config.ts";

const queryClient = new QueryClient();

async function prepare() {
  if (MODE === "development") {
    const { worker } = await import("./mocks/browser");
    return worker.start();
  }
  return Promise.resolve();
}

prepare().then(() => {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <CssBaseline />
        <ReactQueryDevtools />
        <App />
      </QueryClientProvider>
    </React.StrictMode>
  );
});
