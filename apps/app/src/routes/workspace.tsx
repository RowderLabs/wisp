import { FileRoute, Link, Outlet } from "@tanstack/react-router";
import { TreeView, ContextMenu, Toolbar } from "@wisp/ui";
import { CreateCharacterDialog } from "../components/CreateCharacterDialog";
import { TreeData, TreeViewNode, useDialogManager, useTreeView } from "@wisp/ui/src/hooks";
import { rspc } from "@wisp/client";
import {
  HiFolder,
  HiChevronDown,
  HiChevronRight,
  HiOutlineFolder,
  HiOutlineTrash,
} from "react-icons/hi";
import { HiBattery50, HiMiniUserCircle, HiOutlinePencilSquare } from "react-icons/hi2";

export const Route = new FileRoute("/workspace").createRoute({
  loader: ({ context }) =>
    context.rspc.queryClient.ensureQueryData({
      queryKey: ["characters.build_tree"],
      queryFn: () => context.rspc.client.query(['characters.build_tree']),
    }),
  component: WorkspacePage,
});

function WorkspacePage() {
  const tree = Route.useLoaderData()
  const queryClient = rspc.useContext().queryClient;
  const { mutate: deleteCharacter } = rspc.useMutation("characters.delete", {
    onSuccess: () => {
      queryClient.invalidateQueries(["characters.build_tree"]);
    },
  });
  const [_, treeApi] = useTreeView({ onDelete: (id: string) => deleteCharacter(id) });

  return (
    <div className="flex h-screen bg-neutral text-slate-600">
      <div className="h-full basis-[300px] bg-white">
        {tree && (
          <TreeView
            renderItem={(treeItem) => (
              <CharacterItem path={tree[treeItem.id].path} onDelete={(id) => treeApi.deleteNode(id)} {...treeItem} />
            )}
            onExpansionChange={treeApi.toggleExpand}
            treeData={tree as TreeData}
            indentation={25}
            {...treeApi}
          />
        )}
      </div>
      <div className="basis-full">
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
  path,
  expanded,
  onDelete,
  id,
}: Omit<TreeViewNode, "children"> & { path: string | null,expanded?: boolean; onDelete: (id: string) => void }) {
  const [manager] = useDialogManager();

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
      <ContextMenu.Item
        onClick={(e) => {
          e.stopPropagation();
          manager.createDialog(CreateCharacterDialog, { id: "create-character", context: {path} });
        }}
        icon={<HiOutlinePencilSquare />}
      >
        Create character
      </ContextMenu.Item>
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
      <ContextMenu.Item
        disabled
        icon={<HiOutlinePencilSquare />}
      >
        Rename
      </ContextMenu.Item>
      <ContextMenu.Item onClick={() => onDelete(id)} icon={<HiOutlineTrash />}>
        Delete
      </ContextMenu.Item>
      <ContextMenu.Separator />
      <ContextMenu.Item disabled icon={<HiOutlineFolder />}>Go to Family Tree</ContextMenu.Item>
    </ContextMenu.Root>
  );
}
