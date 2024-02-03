import { VariantProps, cva } from "class-variance-authority";
import clsx from "clsx";
import React, { PropsWithChildren } from "react";

interface ButtonProps
  extends React.ComponentPropsWithoutRef<"button">,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const buttonVariants = cva(["rounded-md text-sm px-4 py-2", "transition-all duration-200"], {
  variants: {
    variant: {
      outline: "bg-white text-slate-400 border border-slate-400 hover:bg-slate-400 hover:text-white hover:border-white",
      fill: "bg-slate-400 text-white hover:bg-opacity-80",
    },
  },
  defaultVariants: {
    variant: "fill",
  },
});

export const Button = React.forwardRef<HTMLInputElement, PropsWithChildren<ButtonProps>>(function (
  { children, loading, className, variant, ...rest },
  ref
) {
  return (
    <button {...rest} className={clsx(buttonVariants({ variant }), className)}>
      <div className="flex gap-2 items-center">
        <span>{children}</span>
        {loading && <span className="relative loader"></span>}
      </div>
      <span></span>
    </button>
  );
});
