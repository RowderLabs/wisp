import { useState } from "react";

export type TreeViewNodeInner = {
  id: string;
  name: string;
  isCollection: boolean;
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

type UseTreeViewProps = {
  onDelete: (id: string) => void;
}

export function useTreeView({onDelete}: UseTreeViewProps): [TreeData, TreeViewApiHandle] {
  const [treeData, _setTreeData] = useState<Record<string, TreeViewNode>>({});
  const [viewState, setViewState] = useState<Map<string, boolean | undefined>>(
    new Map([["root", true]])
  );

  function deleteNode(id: string) {
    onDelete(id)
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
