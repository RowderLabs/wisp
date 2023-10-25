import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { VariantProps, cva } from "class-variance-authority";
import {CSS} from '@dnd-kit/utilities'
import clsx from "clsx";
import { PropsWithChildren } from "react";

export type SortableGridChildVariants = VariantProps<typeof sortableGridChildVariants>;
type SortableGridChildProps = {
    id: UniqueIdentifier;
    disabled?: boolean
  } & SortableGridChildVariants;
  
  const sortableGridChildVariants = cva("rounded-md border border-slate-800 bg-slate-100", {
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
        9: "col-span-9",
        10: "col-span-10",
        12: "col-span-12",
      },
    },
    defaultVariants: {
      rowSpan: 1,
      colSpan: 3,
    },
  });
  
  export const SortableGridChild = ({
    rowSpan,
    colSpan,
    id,
    children,
    disabled = false
  }: PropsWithChildren<SortableGridChildProps>) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id, disabled });
    const style = {
      transform: CSS.Translate.toString(transform),
      transition,
    };
    return (
      <div
        style={style}
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={clsx(sortableGridChildVariants({ rowSpan, colSpan }))}
      >
        {children}
      </div>
    );
  };