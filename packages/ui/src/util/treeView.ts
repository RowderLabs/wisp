import { TreeViewNode, TreeViewNodeInner } from "../hooks/useTreeView";

export function findParentOf(
  treeData: Record<string, TreeViewNode>,
  id: string,
  root: string = "root"
) {
  const stack: string[] = [root];

  while (stack.length > 0) {
    const curr = stack.shift() as string;

    for (const child of treeData[curr].children) {
      if (child === id) return treeData[curr];
      stack.push(child);
    }
  }

  return null;
}

export function findChildrenOf(treeData: Record<string, TreeViewNode>, id: string): string[] {
  return treeData[id].children.reduce<string[]>((acc, curr) => {
    return [curr, ...findChildrenOf(treeData, curr)];
  }, []);
}

export function buildTree({
  treeData,
  viewState,
  rootId,
}: {
  treeData: Record<string, TreeViewNode>;
  rootId: string;
  viewState: Map<string, boolean | undefined>;
}) {
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

export function deleteNodeInner(treeData: Record<string, TreeViewNode>, nodeId: string) {
  const parent = findParentOf(treeData, nodeId);
  const children = findChildrenOf(treeData, nodeId);
  const deletedIds = [...children, nodeId];

  return Object.keys(treeData)
    .filter((key) => !deletedIds.find((id) => id === key))
    .reduce<typeof treeData>((acc, key) => {
      if (parent && parent.id === key) {
        acc[key] = { ...parent, children: parent.children.filter((id) => id !== nodeId) };
      } else {
        acc[key] = treeData[key];
      }
      return acc;
    }, {});
}
