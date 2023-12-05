import { useMemo, useState } from "react";
import { deleteNodeInner, buildTree } from "../util/treeView";

export type TreeViewNodeInner = {
  id: string;
  name: string;
  parentId: string | null;
  depth: number;
  children: string[];
};

export type TreeData = Record<string, TreeViewNode>

export type TreeViewNode = Omit<TreeViewNodeInner, "parentId" | "depth">;
export type TreeViewApiHandle = {
  expandAll: () => void;
  collapseAll: () => void;
  viewState: Map<string, boolean | undefined>;
  toggleExpand: (id: string) => void;
  deleteNode: (id: string) => void;
};

export function useTreeView({ initialData }: { initialData: Record<string, TreeViewNode> }): [TreeData, TreeViewApiHandle] {
  const [treeData, setTreeData] = useState<Record<string, TreeViewNode>>(initialData);
  const [viewState, setViewState] = useState<Map<string, boolean | undefined>>(
    new Map([["root", true]])
  );

  function deleteNode(id: string) {
    setTreeData((oldTreeData) => deleteNodeInner(oldTreeData, id));
  }

  function toggleExpand(id: string) {
    const nodeViewState = viewState.get(id) ? undefined : true;
    setViewState((old) => new Map(old).set(id, nodeViewState));
  }

  function expandAll() {
    const expandAllViewState: [string, boolean | undefined][] = Object.keys(treeData)
      .filter((key) => treeData[key].children.length > 0)
      .map((key) => [key, true]);
    setViewState(new Map([...expandAllViewState]));
  }

  function collapseAll() {
    setViewState(new Map([["root", true]]));
  }

  

  const treeApi = {
    viewState,
    collapseAll,
    expandAll,
    toggleExpand,
    deleteNode,
  };

  return [treeData, treeApi]
}
