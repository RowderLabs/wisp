interface TreeViewNode {
  path: string | null;
  name: string;
  children?: TreeViewNode[];
  expanded: boolean;
  isCollection: boolean;
}

type TreeViewItemProps = {} & Omit<TreeViewNode, "children">;

export function TreeViewItem({ name }: TreeViewItemProps) {
  return <div className="rounded-md border p-1">{name}</div>;
}

type TreeViewExpanderProps = {} & TreeViewNode;

export function TreeViewExpander({ children, name, expanded }: TreeViewExpanderProps) {
  const childNodes = children?.map((child) =>
    child.children ? <TreeViewExpander key={child.path} {...child} /> : <TreeViewItem key={child.path} {...child} />
  );
  return (
    <>
      <div>
        <span>{name}</span>
      </div>
      {expanded && <div className="pl-2">{childNodes}</div>}
    </>
  );
}
type TreeViewProps = {
  data: TreeViewNode[];
};
export function TreeView({ data }: TreeViewProps) {
  const nodes = data.map((node) =>
    node.children ? <TreeViewExpander key={node.path} {...node} /> : <TreeViewItem key={node.path} {...node} />
  );

  return <div>{nodes}</div>;
}
