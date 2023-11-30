import React, { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { TreeViewApiHandle, useTreeView } from "./hooks/useTreeView";
import { HiChevronRight, HiChevronDown } from "react-icons/hi";
import { HiDocumentText } from "react-icons/hi";

type TreeViewNodeInner = {
  id: string;
  name: string;
  parentId: string | null;
  depth: number;
  children: string[];
};

type TreeViewNode = Omit<TreeViewNodeInner, "parentId" | "depth">;

type TreeViewProps = {
  initialData: Record<string, TreeViewNode>;
  indentation?: number;
};

export const TreeView = forwardRef<TreeViewApiHandle, TreeViewProps>(function TreeViewInner(
  { initialData, indentation },
  ref
) {

  const { flattenedTree, treeApi } = useTreeView({ initialData });
  useImperativeHandle(ref, () => treeApi, [])

  return (
    <div>
      {flattenedTree.map((node) => (
        <TreeViewNode
          indentation={indentation || 25}
          handleExpand={() => treeApi.toggleExpand(node.id)}
          visible={!node.parentId || treeApi.viewState.get(node.parentId) === true}
          expanded={node.children.length > 0 && treeApi.viewState.get(node.id) === true}
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

export function TreeViewNode({
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
