
import { FileRoute, Outlet } from "@tanstack/react-router";

export const Route = new FileRoute('/workspace/characters').createRoute({
  component: WorkspaceCharactersPage,
});

function WorkspaceCharactersPage() {
  return <Outlet/>
}