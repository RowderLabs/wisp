import { rspc } from "@wisp/client";
import { TreeView } from "@wisp/ui";
import { useDialogManager, useTreeView } from "@wisp/ui/src/hooks";
import { useDeleteCharacter } from "../../hooks/useDeleteCharacter";
import { ConfirmationDialog } from "../ConfirmationDialog";
import { FileTreeItemResolver } from "./FileTreeItemResolver";

export function CharactersFileTree() {
  const { data: treeData, isLoading, isError } = rspc.useQuery(["tree.characters"]);
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
    return <span>loading...</span>;
  }

  if (isError) {
    throw new Error("Failed to get tree");
  }

  return (
    <TreeView
      renderItem={(treeItem) => (
        <FileTreeItemResolver
          itemType={"character"}
          onDelete={(id) => treeApi.deleteNode(id)}
          {...treeItem}
        />
      )}
      onExpansionChange={treeApi.toggleExpand}
      treeData={treeData}
      indentation={25}
      {...treeApi}
    />
  );
}
