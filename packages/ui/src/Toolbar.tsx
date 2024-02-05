import * as RadixToolBar from "@radix-ui/react-toolbar";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import React from "react";

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
export const Toolbar = { IconButton, Root };
