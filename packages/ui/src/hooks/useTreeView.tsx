import { useMemo, useState } from "react";
import { TreeViewItem } from "../TreeView";

export function useTreeView(items: Record<string, Omit<TreeViewItem, "depth">>) {
  const flattenTree = (items: Record<string, Omit<TreeViewItem, "depth">>) => {
    const root = items["root"];
    let stack: TreeViewItem[] = [{ ...root, depth: 0 }];
    let result: TreeViewItem[] = [];

    while (stack.length > 0) {
      const curr = stack.pop() as TreeViewItem;
      if (curr.id !== "root") result.push(curr);
      for (let i = curr.children.length - 1; i >= 0; i--) {
        const child = items[curr.children[i]];
        stack.push({ ...child, depth: curr.depth + 1 });
      }
    }

    return result;
  };

  const [treeItems, setTreeItems] = useState(items);
  const flattenedTreeItems = useMemo(() => flattenTree(treeItems), []);

  return {flattenedTreeItems, setTreeItems}
}
