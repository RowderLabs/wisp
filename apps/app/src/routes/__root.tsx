import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { client, queryClient, RSPCUtils } from "@wisp/client";
import { DialogProvider, Dialogs } from "@wisp/ui";
import { useLockBodyScroll } from "@uidotdev/usehooks";

interface WispRouterContext {
  rspc: {
    utils: RSPCUtils;
    client: typeof client;
    queryClient: typeof queryClient;
  };
}

export const Route = createRootRouteWithContext<WispRouterContext>()({
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
