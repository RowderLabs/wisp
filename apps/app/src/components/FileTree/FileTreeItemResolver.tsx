import { EntityType } from "@wisp/client/src/bindings";
import { TreeViewNode } from "@wisp/ui/src/hooks";
import { CharacterItem } from "./items/CharacterItem";

type FileTreeItemResolverProps<TProps extends FileTreeItemProps> = TProps & {
  itemType: EntityType;
};

export interface FileTreeItemProps extends Omit<TreeViewNode, "children"> {
  path: string | null;
  expanded?: boolean;
  onDelete: (id: string) => void;
}

export function FileTreeItemResolver<TProps extends FileTreeItemProps>({
  itemType,
  ...props
}: FileTreeItemResolverProps<TProps>) {
  if (itemType === "character") {
    return <CharacterItem {...props} />;
  }

  throw new Error("unregistered file tree item type");
}
