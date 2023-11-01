import { VariantProps, cva } from "class-variance-authority";
import React, { PropsWithChildren } from "react";

type GridVariants = VariantProps<typeof gridVariants>;

const gridVariants = cva("grid w-full h-full", {
  variants: {
    gap: {
        none: 'gap-0',
        2: 'gap-2',
        4: 'gap-4',
        6: 'gap-6',
        8: 'gap-8'
    },
    cols: {
        2: 'grid-cols-2',
        4: 'grid-cols-4',
        6: 'grid-cols-6', 
        8: 'grid-cols-8',
        9: 'grid-cols-9',
        12: 'grid-cols-12'
    }
  },
  defaultVariants: {
    gap: 4,
    cols: 4
  },
});

export type GridProps = {} & GridVariants

export default function Grid({children, cols, gap }: PropsWithChildren<GridProps>) {
  return <div className={gridVariants({cols, gap})}>{children}</div>;
}