import { cva, type VariantProps } from "class-variance-authority";
import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { arrayMove, rectSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable";
import { clsx } from "clsx";
import { useState } from "react";

type SortableGridChildVariants = VariantProps<typeof sortableGridChildVariants>;
type SortableGridItem = {
  id: number;
  
};

type GridLayoutItem = {
  rowSpan?: SortableGridChildVariants["rowSpan"];
  colSpan?: SortableGridChildVariants["colSpan"];
}
type SortableGridProps = {
  initialItems: SortableGridItem[];
  layout?: GridLayoutItem[]
};

export const SortableGrid = ({ initialItems, layout }: SortableGridProps) => {
  const [gridItems, setGridItems] = useState(initialItems)

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={(e) => {
      if (!e.over || !e.active) return

      setGridItems((items) => {
        const overIndex = items.findIndex(item => item.id === e.over?.id)
        const activeIndex = items.findIndex(item => item.id === e.active.id)
        const newArray = arrayMove(items, activeIndex, overIndex)
        return newArray
      })

    }}>
      <SortableContext strategy={rectSortingStrategy} items={gridItems}>
        <div className="grid grid-cols-12 gap-4 w-full h-full">
          {gridItems.map((child, i) => (
            <SortableGridChild
              rowSpan={layout ? layout[i].rowSpan : 1}
              colSpan={layout ? layout[i].colSpan : 12}
              id={child.id}
              key={child.id}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

type SortableGridChildProps = {
  id: number;
} & SortableGridChildVariants;

const sortableGridChildVariants = cva("rounded-md bg-blue-400", {
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
    colSpan: 12,
  },
});

export const SortableGridChild = ({ rowSpan, colSpan, id }: SortableGridChildProps) => {
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
      className={clsx(
        sortableGridChildVariants({ rowSpan, colSpan }),
        "flex item-center justify-center p-2"
      )}
    >
      <span>{id}</span>
    </div>
  );
};
