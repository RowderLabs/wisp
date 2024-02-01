import { QueryClient } from "@tanstack/react-query";
import { createReactQueryHooks } from "@rspc/react";
import type { Procedures } from "./bindings.ts"; // These were the bindings exported from your Rust code!
import { createClient } from "@rspc/client";
import { TauriTransport } from "@rspc/tauri";

// You must provide the generated types as a generic and create a transport (in this example we are using HTTP Fetch) so that the client knows how to communicate with your API.
const client = createClient<Procedures>({
  transport: new TauriTransport(),
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { networkMode: "always", refetchOnWindowFocus: false }, mutations: { networkMode: "always" } },
});
const rspc = createReactQueryHooks<Procedures>();

export { rspc, client, queryClient };