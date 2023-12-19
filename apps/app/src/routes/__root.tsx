import { Outlet, RootRoute } from '@tanstack/react-router'

export const Route = new RootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div>
      <Outlet/>
    </div>
  )
}