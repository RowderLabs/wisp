import * as RadixContextMenu from "@radix-ui/react-context-menu";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import { PropsWithChildren } from "react";

interface ContextMenuProps extends RadixContextMenu.MenuContentProps {
  trigger: React.ReactNode;
}

const contextMenuVariants = cva(
  "cursor-default min-w-[12rem] text-xs max-w-[16rem] rounded-md border shadow-md bg-white p-1"
);

const Root = ({ trigger, children }: PropsWithChildren<ContextMenuProps>) => {
  return (
    <RadixContextMenu.Root>
      <RadixContextMenu.Trigger asChild>{trigger}</RadixContextMenu.Trigger>
      <RadixContextMenu.Portal>
        <RadixContextMenu.Content className={contextMenuVariants()}>
          {children}
        </RadixContextMenu.Content>
      </RadixContextMenu.Portal>
    </RadixContextMenu.Root>
  );
};

const Separator = () => {
  return <RadixContextMenu.Separator className="border-b mx-1 my-0.5" />;
};

const contextMenuItemVariants = cva(
  clsx(
    //item format
    "flex max-h-fit min-h-10 overflow-clip rounded-sm px-2 py-1 hover:bg-blue-100 focus:bg-blue-100",
  )
);

interface ContextMenuItemsProps extends RadixContextMenu.MenuItemProps {
  icon?: React.ReactNode
}

const Item = ({ children, icon }: ContextMenuItemsProps) => {
  return (
    <RadixContextMenu.Item className={contextMenuItemVariants()}>
      <div className="flex gap-1 items-center">
        {icon}
        {children}
      </div>
    </RadixContextMenu.Item>
  );
};

export const ContextMenu = {
  Root,
  Separator,
  Item,
};
