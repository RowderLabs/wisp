import { cva, type VariantProps } from "class-variance-authority";
import { UniqueIdentifier } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { arraySwap, rectSwappingStrategy, useSortable } from "@dnd-kit/sortable";
import { clsx } from "clsx";
import { PropsWithChildren } from "react";
import { Sortable } from "./Sortable";
import Grid, { GridProps } from "./Grid";

type SortableGridChildVariants = VariantProps<typeof sortableGridChildVariants>;
type SortableGridItem<T = {}> = {
  id: number;
} & T

type GridLayout = Record<number, GridLayoutDef>;

type GridLayoutDef = {
  rowSpan?: SortableGridChildVariants["rowSpan"];
  colSpan?: SortableGridChildVariants["colSpan"];
};
type SortableGridProps<T> = {
  initialItems: SortableGridItem<T>[];
  gridChild: (item: T) => React.ReactElement;
  defaultColumns?: GridLayoutDef;
  layout?: GridLayout;
} & GridProps;

export function SortableGrid<T = unknown>({
  initialItems,
  layout,
  defaultColumns,
  cols,
  gap,
  gridChild,
}: SortableGridProps<T>){
  return (
    <Sortable
      renderItem={(item, index) => (
        <SortableGridChild
          id={item.id}
          rowSpan={(layout && layout[index]?.rowSpan) || defaultColumns?.rowSpan}
          colSpan={(layout && layout[index]?.colSpan) || defaultColumns?.colSpan}
        >
          {gridChild && gridChild(item)}
        </SortableGridChild>
      )}
      renderContainer={(items) => (
        <Grid cols={cols} gap={gap}>
          {items}
        </Grid>
      )}
      strategy={rectSwappingStrategy}
      reorder={arraySwap}
      initialItems={initialItems}
    />
  );
};

type SortableGridChildProps = {
  id: UniqueIdentifier;
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
}: PropsWithChildren<SortableGridChildProps>) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
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
