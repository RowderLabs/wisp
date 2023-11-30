import { useMemo, useState } from "react";

type TreeViewNodeInner = {
  id: string;
  name: string;
  parentId: string | null;
  depth: number;
  children: string[];
};

type TreeViewNode = Omit<TreeViewNodeInner, "parentId" | "depth">;
export type TreeViewApiHandle = {
    expandAll: () => void,
    collapseAll: () => void,
    viewState: Map<string, boolean | undefined>,
    toggleExpand: (id: string) => void
}
type TreeViewProps = {
  initialData: Record<string, TreeViewNode>;
  indentation?: number;
};

export function useTreeView({ initialData }: { initialData: Record<string, TreeViewNode> }) {
  const [treeData, setTreeData] = useState<Record<string, TreeViewNode>>(initialData);
  const [viewState, setViewState] = useState<Map<string, boolean | undefined>>(
    new Map([["root", true]])
  );

  function toggleExpand(id: string) {
    //find all folder children
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

  const flattenedTree = useMemo(() => flattenTree("root"), [treeData, viewState]);
  function flattenTree(rootId: string) {
    const root = treeData[rootId];
    let parentId: string | null = null;
    const result = [] as TreeViewNodeInner[];
    const stack: TreeViewNodeInner[] = [{ ...root, depth: -1, parentId }];

    while (stack.length > 0) {
      const curr = stack.pop() as TreeViewNodeInner;
      if (curr.id !== rootId) result.push(curr);
      parentId = curr.id;

      //skip processing children if parent not visible
      if (!viewState.get(parentId)) {
        continue;
      }
      for (let i = curr.children.length - 1; i >= 0; i--) {
        const child = treeData[curr.children[i]];
        stack.push({ ...child, depth: curr.depth + 1, parentId });
      }
    }

    return result;
  }

  const treeApi = {
    viewState,
    collapseAll,
    expandAll,
    toggleExpand
  }

  return {treeApi, flattenedTree}
}
