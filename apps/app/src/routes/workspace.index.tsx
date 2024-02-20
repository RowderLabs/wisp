import { createFileRoute } from "@tanstack/react-router";
import { rspc } from "@wisp/client";
import { FactGroupForm } from "../components/FactGroupForm";

export const Route = createFileRoute("/workspace/")({
  staticData: {
    routeBreadcrumb: "workspace",
  },
  component: WorkspaceHome,
});

function WorkspaceHome() {
  const {data: factGroups} = rspc.useQuery(['facts.list'])

  return <div>
    {factGroups && <FactGroupForm group={factGroups[0]}/>}
  </div>;
}
