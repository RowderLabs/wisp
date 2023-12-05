import { forwardRef, useMemo } from "react";
import { TreeData, TreeViewApiHandle, TreeViewNode as TreeViewNodeType } from "./hooks/useTreeView";
import { HiChevronRight, HiChevronDown } from "react-icons/hi";
import { HiDocumentText } from "react-icons/hi";
import { buildTree } from "./util/treeView";

const ROOT_ID = "root";

type TreeViewProps = {
  treeData: TreeData;
  viewState: Map<string, boolean | undefined>;
  onExpansionChange: (id: string) => void;
  indentation?: number;
};

export function TreeView({ treeData, viewState, indentation, onExpansionChange }: TreeViewProps) {
  const flattenedTree = useMemo(
    () => buildTree({ rootId: ROOT_ID, treeData, viewState }),
    [treeData, viewState]
  );

  return (
    <div>
      {flattenedTree.map((node) => (
        <TreeViewItem
          indentation={indentation || 25}
          handleExpand={() => onExpansionChange(node.id)}
          visible={!node.parentId || viewState.get(node.parentId) === true}
          expanded={node.children.length > 0 && viewState.get(node.id) === true}
          isCollection={node.children.length > 0}
          {...node}
        />
      ))}
    </div>
  );
}

type TreeViewItemProps = {
  id: string;
  name: string;
  handleExpand: () => void;
  isCollection: boolean;
  visible: boolean;
  expanded?: boolean;
  indentation: number;
  depth: number;
};

function TreeViewItem({
  name,
  isCollection,
  visible,
  depth,
  handleExpand,
  expanded,
  indentation,
}: TreeViewItemProps) {
  return (
    <>
      {visible && (
        <li
          onClick={() => isCollection && handleExpand()}
          className="rounded-md list-none cursor-pointer hover:bg-blue-100"
        >
          <div style={{ marginLeft: depth * indentation }} className="flex gap-1 items-center p-1">
            {isCollection ? expanded ? <HiChevronDown /> : <HiChevronRight /> : <HiDocumentText />}
            <span>{name}</span>
          </div>
        </li>
      )}
    </>
  );
}
