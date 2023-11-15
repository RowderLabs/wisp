import { PropsWithChildren, createContext, useContext, useState} from 'react';
import { TreeViewNode } from '../TreeView';

export const TreeViewContext = createContext<TreeViewContextType | null>(null);

interface TreeViewContextType {
  data: Record<string, TreeViewNode>
  updateTree: (treeData: TreeViewContextType['data']) => void,
}

export function useTreeView() {
  if (TreeViewContext) {
    return useContext(TreeViewContext)
  }

  throw new Error('Treeview Context Not Found.')
}

export function TreeViewContextProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<TreeViewContextType['data']>({})

  const updateTree = (newState: TreeViewContextType['data']) => {
    setData(newState)
  }
  return (
    <TreeViewContext.Provider value={{data, updateTree}}>
      {children}
    </TreeViewContext.Provider>
  );
}
