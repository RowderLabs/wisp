import { forwardRef, useMemo } from "react";
import { TreeData, TreeViewApiHandle, TreeViewNode as TreeViewNodeType } from "./hooks/useTreeView";
import { HiChevronRight, HiChevronDown } from "react-icons/hi";
import { HiDocumentText } from "react-icons/hi";
import { buildTree } from "./util/treeView";

const ROOT_ID = "root";

type TreeViewProps = {
  treeData: TreeData;
  viewState: Map<string, boolean | undefined>;
  renderItem: TreeViewItemProps["renderItem"];
  onExpansionChange: (id: string) => void;
  indentation?: number;
};

export function TreeView({ treeData, renderItem, viewState, indentation, onExpansionChange }: TreeViewProps) {
  const flattenedTree = useMemo(() => buildTree({ rootId: ROOT_ID, treeData, viewState }), [treeData, viewState]);

  return (
    <div className="text-sm">
      {flattenedTree.map((node) => (
        <TreeViewItem
          key={node.id}
          renderItem={renderItem}
          indentation={indentation || 25}
          handleExpand={() => onExpansionChange(node.id)}
          visible={!node.parentId || viewState.get(node.parentId) === true}
          expanded={Boolean(node.children) && viewState.get(node.id) === true}
          itemIsCollection={node.isCollection === true}
          {...node}
        />
      ))}
    </div>
  );
}

type TreeViewItemProps = {
  handleExpand: () => void;
  itemIsCollection: boolean;
  renderItem: (node: Omit<TreeViewNodeType, 'children'> & {expanded?: boolean}) => JSX.Element;
  visible: boolean;
  expanded?: boolean;
  indentation: number;
  depth: number;
} & Omit<TreeViewNodeType, 'children'>;

function TreeViewItem({
  itemIsCollection,
  visible,
  depth,
  handleExpand,
  expanded,
  renderItem,
  indentation,
  ...node
}: TreeViewItemProps) {
  return (
    <>
      {visible && (
        <li
          onClick={() => itemIsCollection && handleExpand()}
          className="rounded-md list-none cursor-pointer hover:bg-blue-100"
        >
          <div style={{ marginLeft: depth * indentation }} className="flex gap-1 items-center p-1">
            {renderItem({ ...node, expanded })}
          </div>
        </li>
      )}
    </>
  );
}
