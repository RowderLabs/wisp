import { FileRoute, Link, Outlet } from "@tanstack/react-router";
import { TreeView, ImageUploader, ImageUploadOverlay } from "@wisp/ui";
import { TreeData, useTreeView } from "@wisp/ui/src/hooks";
import { Banner } from "../ui/Banner";
import { rspc } from "../rspc/router";
import { HiFolder, HiChevronDown, HiChevronRight } from "react-icons/hi";
import { HiMiniUserCircle } from "react-icons/hi2";

export const Route = new FileRoute("/workspace").createRoute({
  component: WorkspacePage,
});

function WorkspacePage() {
  const [_, treeApi] = useTreeView();
  const { data: tree } = rspc.useQuery(["characters.build_tree"]);

  return (
    <div className="flex h-screen bg-neutral text-slate-600">
      <div className="h-full basis-[300px] bg-white">
        {tree && (
          <TreeView
            renderItem={({ id, name, isCollection, expanded }) => {
              return isCollection ? (
                <>
                  <HiFolder />
                  {expanded ? <HiChevronDown /> : <HiChevronRight />}
                  <span className="basis-full">{name}</span>
                </>
              ) : (
                <>
                  <HiMiniUserCircle />
                  <Link className="basis-full" from={Route.id} to="./characters/$characterId" params={{ characterId: id }}>
                    {name}
                  </Link>
                </>
              );
            }}
            onExpansionChange={treeApi.toggleExpand}
            treeData={tree as TreeData}
            indentation={25}
            {...treeApi}
          />
        )}
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
        <div className="flex px-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
