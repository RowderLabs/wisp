import React, { PropsWithChildren } from "react";
import { cva, type VariantProps } from "class-variance-authority";

export const DraggableGrid: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className="grid gap-4 grid-cols-12 w-full h-full">{children}</div>;
};

type DraggableGridChildProps = {
  disabled: boolean;
} & VariantProps<typeof draggableGridChildVariants>;

const draggableGridChildVariants = cva("rounded-md bg-blue-400", {
  variants: {
    rowSpan: {
      1: "row-span-1",
      2: "row-span-2",
      3: "row-span-3",
      4: "row-span-4",
    },
    colSpan: {
      2: "col-span-2",
      3: "col-span-3",
      4: "col-span-4",
      6: "col-span-6",
      8: "col-span-8",
      10: "col-span-10",
      12: "col-span-12",
    },
  },
  defaultVariants: {
    rowSpan: 1,
    colSpan: 12
  }
});

export const DraggableGridChild = ({ rowSpan, colSpan, disabled = false }: DraggableGridChildProps) => {
  return <div className={draggableGridChildVariants({ rowSpan, colSpan })}></div>;
};
