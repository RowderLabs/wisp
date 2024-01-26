import { FileRoute, Link, Outlet } from "@tanstack/react-router";
import { TreeView, ImageUploader, ImageUploadOverlay, ContextMenu } from "@wisp/ui";
import { TreeData, TreeViewNode, useTreeView } from "@wisp/ui/src/hooks";
import { Banner } from "../ui/Banner";
import { rspc } from "../rspc/router";
import {
  HiFolder,
  HiChevronDown,
  HiChevronRight,
  HiOutlineFolder,
  HiOutlineTrash,
} from "react-icons/hi";
import { HiMiniUserCircle, HiOutlinePencilSquare } from "react-icons/hi2";

export const Route = new FileRoute("/workspace").createRoute({
  component: WorkspacePage,
});

function WorkspacePage() {
  const queryClient = rspc.useContext().queryClient;
  const { mutate: deleteCharacter } = rspc.useMutation("characters.delete", {
    onSuccess: () => {
      queryClient.invalidateQueries(["characters.build_tree"]);
    },
  });
  const [_, treeApi] = useTreeView({ onDelete: (id: string) => deleteCharacter(id) });
  const { data: tree } = rspc.useQuery(["characters.build_tree"]);

  return (
    <div className="flex h-screen bg-neutral text-slate-600">
      <div className="h-full basis-[300px] bg-white">
        {tree && (
          <TreeView
            renderItem={(treeItem) => (
              <CharacterItem onDelete={(id) => treeApi.deleteNode(id)} {...treeItem} />
            )}
            onExpansionChange={treeApi.toggleExpand}
            treeData={tree as TreeData}
            indentation={25}
            {...treeApi}
          />
        )}
      </div>
      <div className="basis-full">
        {/** Character SHeet*/}
        <div className="flex">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function CharacterItem({
  isCollection,
  name,
  expanded,
  onDelete,
  id,
}: Omit<TreeViewNode, "children"> & { expanded?: boolean; onDelete: (id: string) => void }) {
  return isCollection ? (
    <ContextMenu.Root
      trigger={
        <div className="flex items-center gap-1">
          <HiFolder />
          {expanded ? <HiChevronDown /> : <HiChevronRight />}
          <span className="basis-full">{name}</span>
        </div>
      }
    >
      <ContextMenu.Item icon={<HiOutlinePencilSquare />}>Rename</ContextMenu.Item>
      <ContextMenu.Item icon={<HiOutlineTrash />}>Delete</ContextMenu.Item>
    </ContextMenu.Root>
  ) : (
    <ContextMenu.Root
      trigger={
        <div className="flex items-center gap-1 w-full h-full">
          <HiMiniUserCircle />
          <Link
            className="basis-full"
            from={Route.id}
            to="./characters/$characterId"
            params={{ characterId: id }}
          >
            {name}
          </Link>
        </div>
      }
    >
      <ContextMenu.Item icon={<HiOutlinePencilSquare />}>Rename</ContextMenu.Item>
      <ContextMenu.Item onClick={() => onDelete(id)} icon={<HiOutlineTrash />}>
        Delete
      </ContextMenu.Item>
      <ContextMenu.Separator />
      <ContextMenu.Item icon={<HiOutlineFolder />}>Go to Family Tree</ContextMenu.Item>
    </ContextMenu.Root>
  );
}
