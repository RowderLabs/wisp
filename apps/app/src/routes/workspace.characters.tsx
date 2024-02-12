
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute('/workspace/characters')({
  component: WorkspaceCharactersPage,
});

function WorkspaceCharactersPage() {
  return <Outlet/>
}