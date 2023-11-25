import { PropsWithChildren } from "react";
import { TreeViewContext, TreeViewContextProvider, useTreeView } from "./hooks/TreeViewContext";

export type TreeViewItem = {
  id: string;
  name: string;
  children: string[];
};

export function TreeViewNode({
  name,
  id,
  children,
}: {
  name: string;
  id: string;
  children: string[];
}) {
  const { data, open, dispatch } = useTreeView();

  return (
    <li className="rounded-md select-none flex flex-col cursor-pointer list-none">
      <div
        onClick={() =>
          open.get(id) ? dispatch({ id, type: "CLOSE" }) : dispatch({ id, type: "OPEN" })
        }
        className="rounded-md px-1 whitespace-nowrap overflow-hidden hover:bg-blue-100"
      >
        {name}
      </div>
      {children.length > 0 && open.get(id) && (
        <ul className="pl-4">
          {children.map((c) => (
            <TreeViewNode key={data[c].id} {...data[c]} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function TreeViewRoot() {
  const { data } = useTreeView();
  return (
    <>
      {data["root"].children.map((c) => (
        <TreeViewNode key={data[c].id} {...data[c]} />
      ))}
    </>
  );
}

export function TreeView({ items }: { items: Record<string, TreeViewItem> }) {
  return (
    <TreeViewContextProvider initialItems={items}>
      <TreeViewRoot />
    </TreeViewContextProvider>
  );
}
