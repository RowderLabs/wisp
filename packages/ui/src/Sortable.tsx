import { DndContext, UniqueIdentifier, closestCenter } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { SortingStrategy, arrayMove } from "@dnd-kit/sortable";
import React, { useState } from "react";

type Item = { id: UniqueIdentifier };

interface Props<T extends Item> {
  initialItems: T[];
  strategy?: SortingStrategy;
  reorder?: typeof arrayMove;
  renderItem: (item: T, index: number) => React.ReactElement;
  renderContainer: (renderedItems: ReturnType<Props<T>["renderItem"]>[]) => React.ReactElement;
}
export function Sortable<T extends Item>({
  initialItems,
  renderItem,
  strategy = rectSortingStrategy,
  renderContainer,
  reorder = arrayMove,
}: Props<T>) {
  const [items, setItems] = useState<T[]>(initialItems);
  const renderedItems = items.map(renderItem)

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || !e.active) return;

    setItems((items) => {
      const overIndex = items.findIndex((item) => item.id === e.over?.id);
      const activeIndex = items.findIndex((item) => item.id === e.active.id);
      const newArray = reorder(items, activeIndex, overIndex);
      return newArray;
    });
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext strategy={strategy} items={initialItems}>
        {renderContainer(renderedItems)}
      </SortableContext>
    </DndContext>
  );
}
