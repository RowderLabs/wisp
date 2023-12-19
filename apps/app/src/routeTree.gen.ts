import { Route as rootRoute } from "./routes/__root"
import { Route as WorkspaceRoute } from "./routes/workspace"
import { Route as IndexRoute } from "./routes/index"
import { Route as WorkspaceCharactersRoute } from "./routes/workspace.characters"
import { Route as WorkspaceCharactersCharacterIdRoute } from "./routes/workspace.characters.$characterId"

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/": {
      parentRoute: typeof rootRoute
    }
    "/workspace": {
      parentRoute: typeof rootRoute
    }
    "/workspace/characters": {
      parentRoute: typeof WorkspaceRoute
    }
    "/workspace/characters/$characterId": {
      parentRoute: typeof WorkspaceCharactersRoute
    }
  }
}

Object.assign(IndexRoute.options, {
  path: "/",
  getParentRoute: () => rootRoute,
})

Object.assign(WorkspaceRoute.options, {
  path: "/workspace",
  getParentRoute: () => rootRoute,
})

Object.assign(WorkspaceCharactersRoute.options, {
  path: "/characters",
  getParentRoute: () => WorkspaceRoute,
})

Object.assign(WorkspaceCharactersCharacterIdRoute.options, {
  path: "/$characterId",
  getParentRoute: () => WorkspaceCharactersRoute,
})

export const routeTree = rootRoute.addChildren([
  IndexRoute,
  WorkspaceRoute.addChildren([
    WorkspaceCharactersRoute.addChildren([WorkspaceCharactersCharacterIdRoute]),
  ]),
])
