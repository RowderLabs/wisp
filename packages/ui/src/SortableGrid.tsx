import { arraySwap, rectSwappingStrategy } from "@dnd-kit/sortable";
import { Sortable } from "./Sortable";
import Grid, { GridProps } from "./Grid";
import { SortableGridChild, SortableGridChildVariants } from "./SortableGridItem";

type SortableGridItem<T> = {
  id: number;
  disabled?: boolean;
} & T;

type GridLayout = Record<number, GridLayoutDef>;
type GridLayoutDef = {
  rowSpan?: SortableGridChildVariants["rowSpan"];
  colSpan?: SortableGridChildVariants["colSpan"];
};
export type SortableGridProps<T> = {
  initialItems: SortableGridItem<T>[];
  gridChild: (item: SortableGridItem<T>) => React.ReactElement;
  defaultColumns?: GridLayoutDef;
  layout?: GridLayout;
} & GridProps;

export function SortableGrid<T = unknown>({
  initialItems,
  className,
  layout,
  defaultColumns,
  cols,
  gap,
  gridChild,
}: SortableGridProps<T>) {
  return (
    <Sortable
      renderItem={(item, index) => (
        <SortableGridChild
          disabled={item.disabled}
          id={item.id}
          key={item.id}
          rowSpan={(layout && layout[index]?.rowSpan) || defaultColumns?.rowSpan}
          colSpan={(layout && layout[index]?.colSpan) || defaultColumns?.colSpan}
        >
          {gridChild && gridChild(item)}
        </SortableGridChild>
      )}
      renderContainer={(items) => (
        <Grid className={className} cols={cols} gap={gap}>
          {items}
        </Grid>
      )}
      strategy={rectSwappingStrategy}
      reorder={arraySwap}
      initialItems={initialItems}
    />
  );
}
