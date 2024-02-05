import { Outlet, rootRouteWithContext } from "@tanstack/react-router";
import { client, queryClient } from "@wisp/client";
import { DialogProvider, Dialogs } from "@wisp/ui";
import {useLockBodyScroll} from '@uidotdev/usehooks'

export const Route = rootRouteWithContext<{
  rspc: {
    client: typeof client;
    queryClient: typeof queryClient;
  };
}>()({
  component: RootComponent,
});

function RootComponent() {
  useLockBodyScroll()

  return (
    <div>
      <DialogProvider>
        <Outlet />
        <Dialogs/>
      </DialogProvider>
    </div>
  );
}
