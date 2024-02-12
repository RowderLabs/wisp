import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/workspace/")({
  staticData: {
    routeBreadcrumb: "workspace",
  },
  component: WorkspaceHome,
});

function WorkspaceHome() {
  return <p>Hello From Workspace</p>;
}
