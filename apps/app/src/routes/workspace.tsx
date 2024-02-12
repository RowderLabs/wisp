import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { TreeView, ContextMenu } from "@wisp/ui";
import { CreateCharacterDialog } from "../components/CreateCharacterDialog";
import { TreeViewNode, useDialogManager, useTreeView } from "@wisp/ui/src/hooks";
import { rspc, useUtils } from "@wisp/client";
import { HiFolder, HiChevronDown, HiChevronRight, HiOutlineFolder, HiOutlineTrash } from "react-icons/hi";
import { HiMiniUserCircle, HiOutlinePencilSquare } from "react-icons/hi2";
import { ConfirmationDialog } from "../components/ConfirmationDialog";

export const Route = createFileRoute("/workspace")({
  staticData: {
    routeBreadcrumb: "workspace",
  },
  loader: ({ context }) => context.rspc.utils.ensureQueryData(["characters.build_tree"]),
  component: WorkspacePage,
});

function WorkspacePage() {
  const initialTreeData = Route.useLoaderData();
  const utils = useUtils();

  const { data: treeData } = rspc.useQuery(["characters.build_tree"], { initialData: initialTreeData });
  const { mutate: deleteCharacter } = rspc.useMutation("characters.delete", {
    onSuccess: () => {
      utils.invalidateQueries(["characters.build_tree"]);
    },
  });
  const [dialogManager] = useDialogManager();
  const [_, treeApi] = useTreeView({
    onDelete: (id) =>
      dialogManager.createDialog(ConfirmationDialog, {
        id: `delete-character-${id}`,
        message: "Are you sure you want to delete this character",
        onConfirm: () => deleteCharacter(id),
      }),
  });


  return (
    <div className="flex h-screen bg-neutral text-slate-600">
      <div className="h-full basis-[300px] bg-white">
        <TreeView
          renderItem={(treeItem) => <CharacterItem onDelete={(id) => treeApi.deleteNode(id)} {...treeItem} />}
          onExpansionChange={treeApi.toggleExpand}
          treeData={treeData!}
          indentation={25}
          {...treeApi}
        />
      </div>
      <div className="basis-full">
        <div className="flex">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

//TODO: use new TreeNode<TData>
function CharacterItem({
  isCollection,
  name,
  path,
  expanded,
  onDelete,
  id,
}: Omit<TreeViewNode, "children"> & {
  path: string | null;
  expanded?: boolean;
  onDelete: (id: string) => void;
}) {
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
          manager.createDialog(CreateCharacterDialog, {
            id: "create-character",
            context: { path },
          });
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
          <Link className="basis-full" to="/workspace/characters/$characterId" params={{ characterId: id }}>
            {name}
          </Link>
        </div>
      }
    >
      <ContextMenu.Item disabled icon={<HiOutlinePencilSquare />}>
        Rename
      </ContextMenu.Item>
      <ContextMenu.Item onClick={() => onDelete(id)} icon={<HiOutlineTrash />}>
        Delete
      </ContextMenu.Item>
      <ContextMenu.Separator />
      <ContextMenu.Item disabled icon={<HiOutlineFolder />}>
        Go to Family Tree
      </ContextMenu.Item>
    </ContextMenu.Root>
  );
}
