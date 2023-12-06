import { DndContext, UniqueIdentifier, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import React, { PropsWithChildren } from "react";
import { useState } from "react";

type CanvasItem = {
  id: UniqueIdentifier;
  x: number;
  y: number;
};

type DraggableCanvasProps = {
    initialItems: CanvasItem[]
}

export function DraggableCanvas({initialItems}: DraggableCanvasProps) {
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>(initialItems);
  return (
    <DndContext
      onDragEnd={({ active, delta }) => {
        const activeItem = canvasItems.find((item) => item.id === active.id);
        if (!activeItem) return;

        const updated = {
          id: active.id,
          x: activeItem.x + delta.x,
          y: activeItem.y + delta.y,
        };
        setCanvasItems((prev) => [...prev.filter((item) => item.id !== active.id), updated]);

      }}
    >
      {canvasItems.map((item) => (
        <DraggableItem key={item.id} offsetX={item.x} offsetY={item.y} id={item.id} />
      ))}
    </DndContext>
  );
}

type DraggableItemProps = {
  id: UniqueIdentifier;
  offsetX?: number;
  offsetY?: number;
};

function DraggableItem({ id, children, offsetX, offsetY }: PropsWithChildren<DraggableItemProps>) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div
      className="rounded-sm border w-[100px] h-[100px] bg-blue-300 absolute"
      style={{ ...style, top: offsetY, left: offsetX }}
      {...listeners}
      {...attributes}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
}
