import * as RadixContextMenu from "@radix-ui/react-context-menu";
import { cva } from "class-variance-authority";
import { PropsWithChildren } from "react";

interface ContextMenuProps extends RadixContextMenu.MenuContentProps {
  trigger: React.ReactNode;
}

const contextMenuVariants = cva("cursor-default min-w-[12rem] max-w-[16rem] rounded-md border shadow-md bg-white p-1 z-[9999]");

const Root = ({ trigger, children }: PropsWithChildren<ContextMenuProps>) => {
  return (
    <RadixContextMenu.Root modal={false}>
      <RadixContextMenu.Trigger asChild>{trigger}</RadixContextMenu.Trigger>
      <RadixContextMenu.Portal>
        <RadixContextMenu.Content className={contextMenuVariants()}>{children}</RadixContextMenu.Content>
      </RadixContextMenu.Portal>
    </RadixContextMenu.Root>
  );
};

const Separator = () => {
  return <RadixContextMenu.Separator className="border-b mx-1 my-0.5" />;
};

const contextMenuItemVariants = cva([
  "flex max-h-fit min-h-10 text-sm overflow-clip rounded-sm px-2 py-1 hover:bg-blue-100 focus:bg-blue-100",
  'text-xs text-slate-600'
], {
  variants: {
    disabled: {
      true: 'text-[#BCBAC7]'
    }
  }
});

interface ContextMenuItemsProps extends RadixContextMenu.MenuItemProps {
  icon?: React.ReactNode;
}

const Item = ({ children, icon, ...radixProps }: ContextMenuItemsProps) => {
  return (
    //TODO: figure out how to apply disabled state with cva
    <RadixContextMenu.Item {...radixProps} className={contextMenuItemVariants({disabled: radixProps.disabled})}>
      <div className="flex gap-1 items-center w-full h-full">
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
