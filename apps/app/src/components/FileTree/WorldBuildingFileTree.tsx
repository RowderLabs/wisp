
import { rspc } from "@wisp/client";
import { TreeView } from "@wisp/ui";
import { useTreeView } from "@wisp/ui/src/hooks";
import { FileTreeItemResolver } from "./FileTreeItemResolver";

export function WorldBuildingFileTree() {
  const { data: treeData, isLoading, isError } = rspc.useQuery(["tree.worldbuilding"]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, treeApi] = useTreeView({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onDelete: (id) => {},
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