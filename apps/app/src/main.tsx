import ReactDOM from "react-dom/client";
import "./index.css";
import { rspc, client, queryClient, RSPCUtils } from "@wisp/client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Router, RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";


//this is for making rspc custom utils accessible outside components.
const globalUtils = new RSPCUtils(client, queryClient)
// Set up a Router instance
const router = new Router({
  routeTree,
  context: {
    rspc: {
      utils: globalUtils,
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
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </rspc.Provider>
);
