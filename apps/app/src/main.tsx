import ReactDOM from "react-dom/client";
import "./index.css";
import { rspc, client, queryClient } from "./rspc/router";
import { Router, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// Set up a Router instance
const router = new Router({
  routeTree,
  context: {
    rspc: {
      client,
      queryClient,
    },
  },
});

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <rspc.Provider client={client} queryClient={queryClient}>
    <RouterProvider router={router} />
  </rspc.Provider>
);
