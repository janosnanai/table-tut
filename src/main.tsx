import React from "react";
import ReactDOM from "react-dom/client";

import App from "./app.tsx";
import { MODE } from "./config.ts";

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
      <App />
    </React.StrictMode>
  );
});
