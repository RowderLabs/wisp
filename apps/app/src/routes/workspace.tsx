import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CharactersFileTree } from "../components/CharactersFileTree";
import { LocationsFileTree } from "../components/LocationsFileTree";

export const Route = createFileRoute("/workspace")({
  staticData: {
    routeBreadcrumb: "workspace",
  },
  component: WorkspacePage,
});

function WorkspacePage() {
  
  return (
    <div className="flex h-screen bg-neutral text-slate-600">
      <div className="h-full basis-[300px] bg-white">
        <CharactersFileTree/>
        <LocationsFileTree/>
      </div>
      <div className="basis-full">
        <Outlet />
      </div>
    </div>
  );
}


