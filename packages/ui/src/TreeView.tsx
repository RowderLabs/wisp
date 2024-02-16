import React, { PropsWithChildren, useMemo } from "react";
import { buildTree } from "./util/treeView";
import {
  TreeData,
  TreeViewMolecule,
  TreeViewNode,
  TreeViewScope,
  TreeViewScopeType,
  _TreeViewNode,
} from "./molecules/treeview";
import { ScopeProvider, useMolecule } from "bunshi/react";

const ROOT_ID = "root";

type TreeViewRenderNode<TData> = TreeViewNode<TData> & { expanded?: boolean };

type TreeViewProps<TData> = TreeViewScopeType & {
  treeData: TreeData<TData>;
  renderItem: (node: TreeViewRenderNode<TData>) => React.ReactNode;
};

function Provider(props: PropsWithChildren<TreeViewScopeType>) {
  return (
    <ScopeProvider scope={TreeViewScope} value={props}>
      {props.children}
    </ScopeProvider>
  );
}

export function TreeView<TData>({
  treeData,
  renderItem,
  viewState,
  onExpansionChange,
  indentation,
}: TreeViewProps<TData>) {
  return (
    <Provider viewState={viewState} onExpansionChange={onExpansionChange} indentation={indentation}>
      <TreeViewInner treeData={treeData} renderItem={renderItem} />
    </Provider>
  );
}

function TreeViewInner<TData>({ treeData, renderItem }: Omit<TreeViewProps<TData>, keyof TreeViewScopeType>) {
  const { viewState } = useMolecule(TreeViewMolecule);
  const flattenedTree = useMemo(() => buildTree({ rootId: ROOT_ID, treeData, viewState }), [treeData, viewState]);
  return (
    <div className="text-sm">
      {flattenedTree.map((node) => (
        <TreeViewItem {...(treeData[node.id] as TData)} renderItem={renderItem} key={node.id} {...node} />
      ))}
    </div>
  );
}

type TreeViewItemProps<TData> = TreeViewNode<TData> & { renderItem: TreeViewProps<TData>["renderItem"] } & Pick<
    _TreeViewNode,
    "parentId" | "depth"
  >;

function TreeViewItem<TData>({ renderItem, ...node }: TreeViewItemProps<TData>) {
  const { viewState, onExpansionChange, indentation } = useMolecule(TreeViewMolecule);
  const handleExpand = React.useCallback(() => onExpansionChange(node.id), [node.id]);
  const visible = React.useMemo(() => !node.parentId || viewState.get(node.parentId), [node]);
  const expanded = React.useMemo(() => Boolean(node.children) && viewState.get(node.id) === true, [node]);
  return (
    <>
      {visible && (
        <li
          onClick={() => node.isCollection && handleExpand()}
          className="rounded-md px-2 py-1 list-none cursor-pointer hover:bg-blue-100"
        >
          <div style={{ marginLeft: node.depth * (indentation || 25) }}>
            {renderItem({ ...node, expanded } as TreeViewRenderNode<TData>)}
          </div>
        </li>
      )}
    </>
  );
}
