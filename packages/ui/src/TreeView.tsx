import { PropsWithChildren, useMemo, useState } from "react";
import { useTreeView } from "./hooks/useTreeView";

export type TreeViewItem = {
  id: string;
  name: string;
  depth: number;
  children: string[];
};

export function TreeViewNode({ name, id, depth }: TreeViewItem) {
  return (
    <li style={{ marginLeft: depth * 25 }} className="rounded-md p-2 list-none border">
      <span>{name}</span>
    </li>
  );
}

export function TreeView({ items }: { items: Record<string, Omit<TreeViewItem, "depth">> }) {
  const { flattenedTreeItems, setTreeItems } = useTreeView(items);

  return (
    <ul>
      {flattenedTreeItems.map((node) => (
        <TreeViewNode key={node.id} {...node} />
      ))}
    </ul>
  );
}
