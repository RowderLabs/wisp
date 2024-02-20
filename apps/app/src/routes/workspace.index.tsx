import { createFileRoute } from "@tanstack/react-router";
import { rspc } from "@wisp/client";

export const Route = createFileRoute("/workspace/")({
  staticData: {
    routeBreadcrumb: "workspace",
  },
  component: WorkspaceHome,
});

function WorkspaceHome() {
  const {data: facts} = rspc.useQuery(['facts.list'])

  return <div>
    <p>{JSON.stringify(facts)}</p>
  </div>;
}
