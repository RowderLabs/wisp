import { Outlet, rootRouteWithContext } from '@tanstack/react-router'
import { client, queryClient } from '../rspc/router';

export const Route = rootRouteWithContext<{
  rspc: {
    client: typeof client,
    queryClient: typeof queryClient
  }
}>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div>
      <Outlet/>
    </div>
  )
}