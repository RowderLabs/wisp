import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute("/workspace/")({
  staticData: {
    routeBreadcrumb: "workspace",
  },
  component: WorkspaceHome,
});

function WorkspaceHome() {

  return <div>
  </div>;
}
