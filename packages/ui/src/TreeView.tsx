import { useMemo, useState } from "react";

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

export function TreeView({ initialData }: TreeViewProps) {
  const [treeData, setTreeData] = useState<Record<string, TreeViewNode>>(initialData);
  const [test, setTest] = useState<Map<string, boolean | undefined>>(
    new Map([
      ["root", true],
      ["item-1", true],
      ["item-3", true],
    ])
  );
  const [viewState, setViewState] = useState<Map<string, boolean | undefined>>(
    new Map([
      ["root", true],
      ["item-1", true],
      ["item-3", true],
    ])
  );
  const flattenedTree = useMemo(() => flattenTree("root"), [treeData]);

  function collapseNodes(id: string) {
    //find all folder children
    const nodeViewState = viewState.get(id) ? undefined : true;
    const folders = new Map(
      flattenTree(id)
        .filter((node) => node.children.length > 0)
        .map((node) => [node.id, nodeViewState])
    );
    setViewState((old) => {
      return new Map([...new Map(old).set(id, nodeViewState), ...folders]);
    });
  }

  function flattenTree(rootId: string) {
    const root = treeData[rootId];
    let parentId: string | null = null;
    const result = [] as TreeViewNodeInner[];
    const stack: TreeViewNodeInner[] = [{ ...root, depth: -1, parentId }];

    while (stack.length > 0) {
      const curr = stack.pop() as TreeViewNodeInner;
      if (curr.id !== rootId) result.push(curr);
      parentId = curr.id;

      for (let i = curr.children.length - 1; i >= 0; i--) {
        const child = treeData[curr.children[i]];
        stack.push({ ...child, depth: curr.depth + 1, parentId });
      }
    }

    return result;
  }

  return (
    <div>
      {flattenedTree.map((node) => (
        <TreeViewNode
          handleExpand={() => collapseNodes(node.id)}
          visible={!node.parentId || viewState.get(node.parentId) === true}
          isCollection={node.children.length > 0}
          {...node}
        />
      ))}
    </div>
  );
}

type TreeViewNodeProps = {
  id: string;
  name: string;
  handleExpand: () => void;
  isCollection: boolean;
  visible: boolean;
  depth: number;
};

export function TreeViewNode({
  name,
  isCollection,
  visible,
  depth,
  handleExpand,
}: TreeViewNodeProps) {
  return (
    <>
      {visible && (
        <li
          onClick={() => isCollection && handleExpand()}
          style={{ marginLeft: depth * 25 }}
          className="rounded-md border list-none p-1"
        >
          {name}
        </li>
      )}
    </>
  );
}
