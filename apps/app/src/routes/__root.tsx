import { Outlet, rootRouteWithContext } from "@tanstack/react-router";
import { client, queryClient } from "@wisp/client";
import { DialogProvider, Dialogs } from "@wisp/ui";

export const Route = rootRouteWithContext<{
  rspc: {
    client: typeof client;
    queryClient: typeof queryClient;
  };
}>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div>
      <DialogProvider>
        <Outlet />
        <Dialogs/>
      </DialogProvider>
    </div>
  );
}
