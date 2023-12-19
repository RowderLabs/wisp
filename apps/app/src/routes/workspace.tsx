import { FileRoute, Link, Outlet } from "@tanstack/react-router";
import { TreeView, ImageUploader, ImageUploadOverlay } from "@wisp/ui";
import { TreeData, useTreeView } from "@wisp/ui/src/hooks";
import { Banner } from "../ui/Banner";

export const Route = new FileRoute("/workspace").createRoute({
  component: WorkspacePage,
});

function WorkspacePage() {
  const data: TreeData = {
    root: {
      id: "root",
      name: "root",
      children: ["characters", "timelines"],
    },
    characters: {
      id: "characters",
      children: ["sage"],
      name: "Characters",
    },
    timelines: {
      id: "timelines",
      children: ["the-first-war"],
      name: "Timelines",
    },
    "the-first-war": {
      id: "the-first-war",
      children: [],
      name: "The First War",
    },
    sage: {
      id: "sage",
      children: [],
      name: "Sage",
    },
  };
  const [treeData, treeApi] = useTreeView({ initialData: data });

  return (
    <div className="flex h-screen bg-neutral text-slate-600">
      <div className="h-full basis-[300px] bg-white">
        <TreeView
          onExpansionChange={treeApi.toggleExpand}
          treeData={treeData}
          indentation={25}
          {...treeApi}
        />
      </div>
      <div className="basis-full">
        <ImageUploader>
          {({ wrapperStyle, ...props }) => (
            <Banner style={wrapperStyle} className="bg-slate-300">
              <ImageUploadOverlay {...props} />
            </Banner>
          )}
        </ImageUploader>
        {/** Character SHeet*/}
        <Outlet />
        <Link from={Route.id} to="./characters/$characterId" params={{ characterId: "1" }}>
          Characters
        </Link>
      </div>
    </div>
  );
}
