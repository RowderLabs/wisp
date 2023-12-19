import React, { useRef } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { rspc, client, queryClient } from "./rspc/router";
import {
  Outlet,
  RouterProvider,
  Link,
  Router,
  Route,
  RootRoute,
} from '@tanstack/react-router'
import { CharacterSheet } from "./router/CharacterSheet";

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootRoute = new RootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div>
      <Outlet />
    </div>
  )
}

function Characters() {
  const { data: characters } = rspc.useQuery(['characters.find'])
  const { mutate: createCharacter } = rspc.useMutation('characters.create')
  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <div>
      <div>Character List</div>
      <label htmlFor="character-creator">New Character</label>
      <input id="character-creator" ref={inputRef} onChange={(e) => inputRef.current!.value = e.target.value} type="text" />
      <button onClick={() => {
        createCharacter({ fullName: inputRef.current!.value, path: '' })
        inputRef.current!.value = ''
      }}>Submit</button>
      <ul>
        {characters?.map(({ fullName, id }) => <li><Link key={id} to="/characters/$characterId" params={{ characterId: id.toString() }}>{fullName}</Link></li>)}
      </ul>
    </div>
  )
}

const indexRoute = new Route({ getParentRoute: () => rootRoute, path: '/', component: App })
const charactersRoute = new Route({ getParentRoute: () => indexRoute, path: 'characters' })
const charactersRouteIndex = new Route({ getParentRoute: () => charactersRoute, path: '/', component: Characters })
const characterSheetRoute = new Route({ getParentRoute: () => charactersRoute, path: '$characterId', component: CharacterSheet })


const routeTree = rootRoute.addChildren([
  indexRoute.addChildren([charactersRoute.addChildren([charactersRouteIndex, characterSheetRoute])]),
])

const router = new Router({ routeTree })


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>

    <rspc.Provider client={client} queryClient={queryClient}>
      <RouterProvider router={router} />
    </rspc.Provider>
  </React.StrictMode>,
);
