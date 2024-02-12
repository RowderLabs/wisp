import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { client, queryClient, RSPCUtils } from "@wisp/client";
import { DialogProvider, Dialogs } from "@wisp/ui";
import { useLockBodyScroll } from "@uidotdev/usehooks";

export const Route = createRootRouteWithContext<{
  rspc: {
    utils: RSPCUtils;
    client: typeof client;
    queryClient: typeof queryClient;
  };
}>()({
  component: RootComponent,
});

function RootComponent() {
  useLockBodyScroll();

  return (
    <div>
      <DialogProvider>
        <Outlet />
        <Dialogs />
      </DialogProvider>
    </div>
  );
}
