import {
  Dispatch,
  PropsWithChildren,
  createContext,
  useContext,
  useReducer,
  useState,
} from "react";
import { TreeViewItem } from "../TreeView";

export const TreeViewContext = createContext<TreeViewContextType | null>(null);
type TreeViewOpenState = Map<string, boolean>;

interface TreeViewContextType {
  open: TreeViewOpenState;
  dispatch: Dispatch<TreeViewActions>;
  data: Record<string, TreeViewItem>;
  selected: string | null;
}

export type TreeViewActions =
  | {
      type: "OPEN";
      id: string;
    }
  | {
      type: "CLOSE";
      id: string;
    };

export function treeviewReducer(
  state: TreeViewOpenState,
  action: TreeViewActions
): TreeViewOpenState {
  switch (action.type) {
    case "OPEN":
      return new Map(state).set(action.id, true);

    case "CLOSE":
      return new Map(state).set(action.id, false);

    default:
      throw new Error("Tree Reducer received an unknown action");
  }
}

export function useTreeView() {
  if (TreeViewContext) {
    return useContext(TreeViewContext) as TreeViewContextType;
  }

  throw new Error("Treeview Context Not Found.");
}

export function TreeViewContextProvider({
  children,
  initialItems,
}: PropsWithChildren<{ initialItems: Record<string, TreeViewItem> }>) {
  const [data, setData] = useState<TreeViewContextType["data"]>(initialItems);
  const [open, dispatch] = useReducer(treeviewReducer, new Map<string, boolean>());
  const [selected, setSelected] = useState(null);

  return (
    <TreeViewContext.Provider value={{ data, open, selected, dispatch }}>
      {children}
    </TreeViewContext.Provider>
  );
}
