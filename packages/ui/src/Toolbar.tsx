import * as RadixToolBar from "@radix-ui/react-toolbar";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import React, { PropsWithChildren } from "react";

interface ToolbarProps extends RadixToolBar.ToolbarProps {}

const toolbarVariants = cva(["flex w-full p-1 gap-1 bg-white min-w-fit rounded-md shadow-sm"], {
  variants: {
    orientation: {
      horizontal: "flex-row items-center",
      vertical: "flex-col justify-center",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

function Root({ orientation, ...radixProps }: ToolbarProps) {
  return (
    <RadixToolBar.Root
      orientation={orientation}
      {...radixProps}
      className={toolbarVariants({ orientation })}
    ></RadixToolBar.Root>
  );
}

interface ToolbarButtonProps extends RadixToolBar.ToolbarButtonProps {}
interface ToolbarIconButtonProps extends ToolbarButtonProps {
  icon: React.ReactNode;
}

const toolbarButtonVariants = cva(["rounded-md p-1 text-lg text-slate-500"], {
  variants: {
    disabled: {
      true: "text-slate-300 hover:none",
      false: "hover:bg-blue-200",
    },
  },
});

function IconButton({ icon, disabled = false, ...radixProps }: ToolbarIconButtonProps) {
  return (
    <RadixToolBar.Button disabled={disabled} {...radixProps} className={clsx(toolbarButtonVariants({ disabled }))}>
      <div className="flex w-6 h-6 justify-center items-center">{icon}</div>
    </RadixToolBar.Button>
  );
}

interface ToolbarToggleItemProps extends RadixToolBar.ToolbarToggleItemProps {
  icon: React.ReactNode;
}

interface ToolbarToggleGroupProps extends RadixToolBar.ToolbarToggleGroupSingleProps, PropsWithChildren {}

function ToggleGroup({ children }: ToolbarToggleGroupProps) {
  return <RadixToolBar.ToggleGroup type="single">{children}</RadixToolBar.ToggleGroup>;
}

const toolbarToggleItemVariants = cva([
  "data-[state=on]:bg-blue-200 data-[state=on]:shadow-sm, data-[state=off]:bg-inherit",
]);
function ToggleItem({ icon, disabled = false, ...radixProps}: ToolbarToggleItemProps) {
  return (
    <RadixToolBar.ToggleItem
      className={clsx(toolbarButtonVariants({ disabled }), toolbarToggleItemVariants())}
      disabled={disabled}
      {...radixProps}
    >
      <div className="flex w-6 h-6 justify-center items-center">{icon}</div>
    </RadixToolBar.ToggleItem>
  );
}
export const Toolbar = { IconButton, Root, ToggleItem, ToggleGroup };
