import { Link } from "@tanstack/react-router";
import { rspc } from "@wisp/client";
import { ContextMenu, TreeView } from "@wisp/ui";
import { TreeViewNode, useDialogManager, useTreeView } from "@wisp/ui/src/hooks";
import { HiFolder, HiChevronDown, HiChevronRight, HiOutlinePencilSquare, HiOutlineTrash, HiMap } from "react-icons/hi2";
import { CreateLocationsDialog } from "./CreateLocationDialog";

export function EntityFileTree() {
  const { data: treeData, isLoading, isError } = rspc.useQuery(["locations.tree"]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, treeApi] = useTreeView({
    onDelete: (id) => console.log(id),
  });

  if (isLoading) {
    return <span>loading...</span>;
  }

  if (isError) {
    throw new Error("Failed to get tree");
  }

  return (
    <TreeView
      renderItem={(treeItem) => <LocationItem onDelete={(id) => treeApi.deleteNode(id)} {...treeItem} />}
      onExpansionChange={treeApi.toggleExpand}
      treeData={treeData}
      indentation={25}
      {...treeApi}
    />
  );
}

//TODO: use new TreeNode<TData>
function LocationItem({
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
  const [dialogManager] = useDialogManager();

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
          dialogManager.createDialog(CreateLocationsDialog, {
            id: "create-location",
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
          <HiMap />
          <Link
            className="basis-full"
            to="/workspace/entity/$entityId"
            search={{ type: "location" }}
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
    </ContextMenu.Root>
  );
}
