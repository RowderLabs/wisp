import { FileRoute, Link, Outlet } from "@tanstack/react-router";
import { TreeView, ContextMenu, Dialog, DialogProps, Input, Label, Button } from "@wisp/ui";
import { TreeData, TreeViewNode, useDialogManager, useTreeView } from "@wisp/ui/src/hooks";
import { rspc } from "@wisp/client";
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
  const [manager] = useDialogManager();

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
        <button onClick={() => manager.createDialog(Dialog, { id: "create" })}>Hello</button>
        {/** Character SHeet*/}
        <div className="flex">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function CreateCharacterDialog({ open, onOpenChange, id }: DialogProps) {
  return (
    <Dialog
      onInteractOutside={(e) => e.preventDefault()}
      id={id}
      open={open}
      onOpenChange={onOpenChange}
      trigger={undefined}
    >
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex flex-col gap-1 justify-start">
          <Label htmlFor="name">Character Name</Label>
          <Input name="name" placeholder="enter a name for your character" />
        </div>
      </div>
      <div>
        <Button loading={true} className="w-full flex justify-center">Submit</Button>
      </div>
    </Dialog>
  );
}

function CharacterItem({
  isCollection,
  name,
  expanded,
  onDelete,
  id,
}: Omit<TreeViewNode, "children"> & { expanded?: boolean; onDelete: (id: string) => void }) {
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
          manager.createDialog(CreateCharacterDialog, { id: "create-character" });
        }}
        icon={<HiOutlinePencilSquare />}
      >
        Create character
      </ContextMenu.Item>
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
      <ContextMenu.Item
        onClick={() => manager.createDialog(Dialog, { id: "create-character" })}
        icon={<HiOutlinePencilSquare />}
      >
        Rename
      </ContextMenu.Item>
      <ContextMenu.Item onClick={() => onDelete(id)} icon={<HiOutlineTrash />}>
        Delete
      </ContextMenu.Item>
      <ContextMenu.Separator />
      <ContextMenu.Item icon={<HiOutlineFolder />}>Go to Family Tree</ContextMenu.Item>
    </ContextMenu.Root>
  );
}
