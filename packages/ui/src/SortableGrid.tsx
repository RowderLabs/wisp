import { cva, type VariantProps } from "class-variance-authority";
import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { rectSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable";
import { clsx } from "clsx";

type SortableGridChildVariants = VariantProps<typeof sortableGridChildVariants>;
type SortableGridItem = {
  id: number;
  rowSpan?: SortableGridChildVariants["rowSpan"];
  colSpan?: SortableGridChildVariants["colSpan"];
};
type SortableGridProps = {
  items: SortableGridItem[];
};

export const SortableGrid = ({ items }: SortableGridProps) => {
  const onDragEnd = (event: DragEndEvent) => {};
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext  strategy={rectSortingStrategy} items={items}>
        <div className="grid grid-cols-12 gap-4 w-full h-full">
          {items.map((child) => (
            <SortableGridChild
              rowSpan={child.rowSpan || 1}
              colSpan={child.colSpan || 12}
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
    transform: CSS.Transform.toString(transform),
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
