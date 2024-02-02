import { FileRoute, Link, Outlet } from "@tanstack/react-router";
import { TreeView, ContextMenu, useDialog, Modal, ModalProps, useDialogsContext } from "@wisp/ui";
import { TreeData, TreeViewNode, useTreeView } from "@wisp/ui/src/hooks";
import { rspc } from "@wisp/client";
import {
  HiFolder,
  HiChevronDown,
  HiChevronRight,
  HiOutlineFolder,
  HiOutlineTrash,
} from "react-icons/hi";
import { HiMiniUserCircle, HiOutlinePencilSquare } from "react-icons/hi2";
import { useRenderCount } from "@uidotdev/usehooks";
import { useEffect } from "react";

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
  const [manager] = useDialog(CustomModal);

  const { dialogs } = useDialogsContext();
  const renderCount = useRenderCount();

  const renderDialogs = Object.keys(dialogs).map((id) => {
    //todo: store props with dialog so we can trigger programmatically
    const Dialog = dialogs[id].component;
    return (
      <Dialog
        {...dialogs[id].props}
        onOpenChange={() => manager.removeDialog(id)}
        open={dialogs[id].active}
        key={id}
      />
    );
  });

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
        {renderDialogs}
        <button
          className="rounded-md p-1 bg-blue-500 text-white"
          onClick={() => {
            manager.createDialog({ id: "rowder", name: "Hello" });

            setTimeout(() => {
              manager.createDialog({ id: "cat", name: "cat" });
            }, 500);
          }}
        >
          add
        </button>
        <div className="border border-red-500">{renderCount}</div>
        {/** Character SHeet*/}
        <div className="flex">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function CustomModal({ name, open, onOpenChange }: { name: string } & ModalProps) {
  const [manager] = useDialog(CustomModal)

  useEffect(() => {

    const timer = setTimeout(() => {
      manager.removeDialog('cat')

      return () => clearTimeout(timer)

    }, 1000)

  }, [])
  return (
    <Modal open={open} onOpenChange={onOpenChange} trigger={undefined}>
      <h3>{name}</h3>
      <p>
        There are two kinds of atoms: a writable atom and a read-only atom. Primitive atoms are
        always writable. Derived atoms are writable if the write is specified. The write of
        primitive atoms is equivalent to the setState of React.useState.
      </p>
    </Modal>
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
