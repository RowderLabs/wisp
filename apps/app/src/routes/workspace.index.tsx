import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/workspace/")({
  staticData: {
    routeBreadcrumb: "workspace",
  },
  component: WorkspaceHome,
});

function WorkspaceHome() {
  return <div>
    <FactList/>
  </div>;
}

function Fact() {
  return (
    <div className="p-2 flex justify-between items-center border-b">
      <p>First Name</p>
      <p>Matt</p>
    </div>
  );
}

export function FactList() {
  return (
    <div className="bg-white rounded-md border text-sm p-8 mx-auto flex flex-col gap-2 max-w-[600px]">
      <Fact />
      <Fact />
      <Fact />
    </div>
  );
}
