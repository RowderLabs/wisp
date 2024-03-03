import { ContextMenu } from "@wisp/ui";
import { CreateCharacterDialog } from "../../CreateCharacterDialog";
import { Link } from "@tanstack/react-router";
import { useDialogManager } from "@wisp/ui/src/hooks";
import {
  HiFolder,
  HiChevronDown,
  HiChevronRight,
  HiOutlinePencilSquare,
  HiMiniUserCircle,
  HiOutlineTrash,
  HiOutlineFolder,
} from "react-icons/hi2";
import { FileTreeItemProps } from "../FileTreeItemResolver";

interface CharacterItemProps extends FileTreeItemProps {}
//TODO: use new TreeNode<TData>
export function CharacterItem({
  isCollection,
  name,
  path,
  expanded,
  onDelete,
  id,
}: CharacterItemProps) {
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
          <Link
            className="basis-full"
            to="/workspace/entity/$entityId"
            search={{ type: "character" }}
            params={{ entityId: id }}
          >
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
