import * as RadixContextMenu from "@radix-ui/react-context-menu";
import { clsx } from "clsx";

import { FC, PropsWithChildren } from "react";

type ContextMenuItem = {
  label: string;
};
type ContextGroup = {
  items: ContextMenuItem[];
  label: string;
  showLabel?: boolean;
};

interface ContextGroupProps extends ContextGroup {
  showSeparator: boolean;
}
interface ContextMenuItemProps extends ContextMenuItem {}

const ContextMenu: FC<PropsWithChildren<{ ctx: { groups: ContextGroup[] } }>> = ({ children, ctx }) => {
  return (
    <RadixContextMenu.Root>
      <RadixContextMenu.Trigger className="w-full">{children}</RadixContextMenu.Trigger>
      <RadixContextMenu.Portal>
        <RadixContextMenu.Content className="min-w-[200px] bg-white rounded-md text-xs text-slate-800 overflow-hidden p-1 shadow-sm">
          {ctx.groups.map((group, i) => (
            <ContextGroup
              showSeparator={i < ctx.groups.length - 1}
              key={i}
              showLabel={group.showLabel}
              label={group.label}
              items={group.items}
            />
          ))}
        </RadixContextMenu.Content>
      </RadixContextMenu.Portal>
    </RadixContextMenu.Root>
  );
};

const ContextGroup = ({ items, label, showLabel: showLabel = false, showSeparator }: ContextGroupProps) => {
  const contextItems = items.map((item) => <ContextMenuItem key={item.label} label={item.label} />);
  return (
    <>
      {showLabel && (
        <RadixContextMenu.Label className="select-none px-2 py-1">
          {label}
        </RadixContextMenu.Label>
      )}
      {contextItems}
      {showSeparator && <RadixContextMenu.Separator className="my-1 h-px bg-slate-500" />}
    </>
  );
};

const ContextMenuItem = ({ label }: ContextMenuItemProps) => {
  return (
    <>
      <RadixContextMenu.ContextMenuItem
        className={clsx(
          "flex cursor-default select-none items-center rounded-md px-2 py-2 outline-none",
          "focus:bg-slate-500 focus:text-slate-200 dark:focus:bg-gray-900"
        )}
      >
        {label}
      </RadixContextMenu.ContextMenuItem>
    </>
  );
};

export default ContextMenu;
