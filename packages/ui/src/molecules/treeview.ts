import { createScope, molecule } from "bunshi/react";
import invariant from "tiny-invariant";


export type TreeData<TData> = Record<string, TreeViewNode<TData>>

export type _TreeViewNode = {
  id: string;
  name: string;
  isCollection: boolean;
  parentId: string | null;
  depth: number;
  children: string[];
};

export type TreeViewNode<TData> = Omit<_TreeViewNode, 'parentId' | 'depth'> & TData

export type TreeViewScopeType = {
  viewState: Map<string, boolean | undefined>;
  onExpansionChange: (id: string) => void;
  indentation?: number;
};

export const TreeViewScope = createScope<TreeViewScopeType | undefined>(undefined)

export const TreeViewMolecule = molecule((_, scope) => {
  const ctx = scope(TreeViewScope)
  invariant(ctx, "no treeview context")

  return ctx

})