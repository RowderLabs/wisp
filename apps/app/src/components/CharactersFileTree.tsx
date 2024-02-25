import { Link } from "@tanstack/react-router";
import { rspc } from "@wisp/client";
import { ContextMenu, TreeView } from "@wisp/ui";
import { TreeViewNode, useDialogManager, useTreeView } from "@wisp/ui/src/hooks";
import { HiFolder, HiChevronDown, HiChevronRight, HiOutlinePencilSquare, HiMiniUserCircle, HiOutlineTrash, HiOutlineFolder } from "react-icons/hi2";
import { useDeleteCharacter } from "../hooks/useDeleteCharacter";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { CreateCharacterDialog } from "./CreateCharacterDialog";

export function CharactersFileTree() {

  const { data: treeData, isLoading, isError } = rspc.useQuery(["characters.build_tree"]);
  const { deleteCharacter } = useDeleteCharacter();

  const [dialogManager] = useDialogManager();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, treeApi] = useTreeView({
    onDelete: (id) =>
      dialogManager.createDialog(ConfirmationDialog, {
        id: `delete-character-${id}`,
        message: "Are you sure you want to delete this character",
        onConfirm: () => deleteCharacter(id),
      }),
  });

  if (isLoading) {
    return <span>loading...</span>
  }

  if (isError) {
    throw new Error("Failed to get tree")
  }

  return (
    <TreeView
          renderItem={(treeItem) => <CharacterItem onDelete={(id) => treeApi.deleteNode(id)} {...treeItem} />}
          onExpansionChange={treeApi.toggleExpand}
          treeData={treeData}
          indentation={25}
          {...treeApi}
        />
  )
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