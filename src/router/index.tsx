import { Router, Route, RootRoute } from "@tanstack/router";

import RootLayout from "./layouts/root-layout";
import IndexView from "./views/index-view";
import ClientSideView from "./views/client-side-view";
import ServerSideView from "./views/server-side-view";

const rootRoute = new RootRoute({
  component: RootLayout,
});

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexView,
});

const clientSideRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/client-side",
  component: ClientSideView,
});

const serverSideRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/server-side",
  component: ServerSideView,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  clientSideRoute,
  serverSideRoute,
]);

const router = new Router({ routeTree });

declare module "@tanstack/router" {
  interface Register {
    router: typeof router;
  }
}

export default router;
