/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as WorkspaceImport } from './routes/workspace'
import { Route as IndexImport } from './routes/index'
import { Route as WorkspaceIndexImport } from './routes/workspace.index'
import { Route as WorkspaceCharactersImport } from './routes/workspace.characters'
import { Route as WorkspaceCharactersCharacterIdImport } from './routes/workspace.characters.$characterId'

// Create/Update Routes

const WorkspaceRoute = WorkspaceImport.update({
  path: '/workspace',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const WorkspaceIndexRoute = WorkspaceIndexImport.update({
  path: '/',
  getParentRoute: () => WorkspaceRoute,
} as any)

const WorkspaceCharactersRoute = WorkspaceCharactersImport.update({
  path: '/characters',
  getParentRoute: () => WorkspaceRoute,
} as any)

const WorkspaceCharactersCharacterIdRoute =
  WorkspaceCharactersCharacterIdImport.update({
    path: '/$characterId',
    getParentRoute: () => WorkspaceCharactersRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/workspace': {
      preLoaderRoute: typeof WorkspaceImport
      parentRoute: typeof rootRoute
    }
    '/workspace/characters': {
      preLoaderRoute: typeof WorkspaceCharactersImport
      parentRoute: typeof WorkspaceImport
    }
    '/workspace/': {
      preLoaderRoute: typeof WorkspaceIndexImport
      parentRoute: typeof WorkspaceImport
    }
    '/workspace/characters/$characterId': {
      preLoaderRoute: typeof WorkspaceCharactersCharacterIdImport
      parentRoute: typeof WorkspaceCharactersImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  IndexRoute,
  WorkspaceRoute.addChildren([
    WorkspaceCharactersRoute.addChildren([WorkspaceCharactersCharacterIdRoute]),
    WorkspaceIndexRoute,
  ]),
])

/* prettier-ignore-end */
