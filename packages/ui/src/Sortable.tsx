import { DndContext, UniqueIdentifier, closestCenter } from "@dnd-kit/core";
import type {
  DragEndEvent,
  DragStartEvent,
  DraggableSyntheticListeners,
  DraggableAttributes,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS, Transform } from "@dnd-kit/utilities";
import { SortingStrategy, arrayMove } from "@dnd-kit/sortable";
import React, { PropsWithChildren, forwardRef, useState } from "react";
import { SortableGridChild } from "./SortableGrid";

type Item = { id: UniqueIdentifier };

interface Props<T extends Item> {
  initialItems: T[];
  strategy?: SortingStrategy;
  reorder?: typeof arrayMove;
  renderItem: (item: T, index: number) => React.ReactElement;
  Container: any;
}
export function Sortable<T extends Item>({
  initialItems,
  renderItem,
  strategy = rectSortingStrategy,
  Container,
  reorder = arrayMove,
}: Props<T>) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [activeId, setActiveId] = useState<UniqueIdentifier>();

  const onDragStart = (e: DragStartEvent) => {
    setActiveId(e.active.id);
  };

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || !e.active) return;

    setItems((items) => {
      const overIndex = items.findIndex((item) => item.id === e.over?.id);
      const activeIndex = items.findIndex((item) => item.id === activeId);
      const newArray = reorder(items, activeIndex, overIndex);
      return newArray;
    });
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <SortableContext strategy={strategy} items={initialItems}>
        <Container>{items.map(renderItem)}</Container>
      </SortableContext>
    </DndContext>
  );
}

interface SortableItemProps {
  id: UniqueIdentifier;
}
