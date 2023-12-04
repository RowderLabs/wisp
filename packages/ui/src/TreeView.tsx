import React, { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { TreeViewApiHandle, TreeViewNode } from "./hooks/useTreeView";
import { HiChevronRight, HiChevronDown } from "react-icons/hi";
import { HiDocumentText } from "react-icons/hi";
import { buildTree } from "./util/treeView";

type TreeViewNodeInner = {
  id: string;
  name: string;
  parentId: string | null;
  depth: number;
  children: string[];
};


type TreeViewProps = {
  treeData: Record<string, TreeViewNode>;
  viewState: Map<string, boolean | undefined>;
  onExpansionChange: (id: string) => void;
  indentation?: number;
};

export const TreeView = forwardRef<TreeViewApiHandle, TreeViewProps>(function TreeViewInner(
  { treeData, viewState, indentation, onExpansionChange },
  ref
) {

  const flattenedTree = useMemo(
    () => buildTree({ rootId: "root", treeData, viewState }),
    [treeData, viewState]
  );

  return (
    <div>
      {flattenedTree.map((node) => (
        <TreeViewNode
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
});

type TreeViewNodeProps = {
  id: string;
  name: string;
  handleExpand: () => void;
  isCollection: boolean;
  visible: boolean;
  expanded?: boolean;
  indentation: number;
  depth: number;
};

function TreeViewNode({
  name,
  isCollection,
  visible,
  depth,
  handleExpand,
  expanded,
  indentation,
}: TreeViewNodeProps) {
  return (
    <>
      {visible && (
        <li
          onClick={() => isCollection && handleExpand()}
          className="rounded-md list-none hover:bg-blue-100"
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
