import { DndContext, MouseSensor, UniqueIdentifier, useDraggable, useSensor } from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import React, { PropsWithChildren, forwardRef, useImperativeHandle } from "react";
import { useState } from "react";

type CanvasItem = {
  id: UniqueIdentifier;
  x: number;
  y: number;
  renderItem?: () => JSX.Element;
};

type DraggableCanvasProps = {
  initialItems?: CanvasItem[];
};


export type DraggableCanvasHandle = {
  createCanvasItem: (item: CanvasItem) => void;
  deleteCanvasItem: (id: CanvasItem['id']) => void;
};

export const DraggableCanvas = forwardRef<DraggableCanvasHandle, DraggableCanvasProps>(
  ({ initialItems = [] }, ref) => {

    useImperativeHandle(ref, () => {
      return {
        createCanvasItem: (item) => {
          setCanvasItems((old) => [...old, item])
        },
        deleteCanvasItem: (id) => {
          setCanvasItems((old) => old.filter((item) => item.id !== id))
        } 
      }
    })
    const mouseSensor = useSensor(MouseSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    });
    const [canvasItems, setCanvasItems] = useState<CanvasItem[]>(initialItems);
    return (
      <DndContext
        sensors={[mouseSensor]}
        modifiers={[restrictToParentElement]}
        onDragEnd={({ active, delta }) => {
          const activeItem = canvasItems.find((item) => item.id === active.id);
          if (!activeItem) return;

          const updated = {
            ...activeItem,
            x: activeItem.x + delta.x,
            y: activeItem.y + delta.y,
          };
          setCanvasItems((prev) => [...prev.filter((item) => item.id !== active.id), updated]);
        }}
      >
        {canvasItems.map((item) => (
          <DraggableItem key={item.id} offsetX={item.x} offsetY={item.y} id={item.id}>
            {item.renderItem ? item.renderItem() : <div className="w-[50px] h-[50px] bg-red-500"></div>}
          </DraggableItem>
        ))}

      </DndContext>
    );
  }
);

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
      className="rounded-sm absolute p-1"
      style={{ ...style, top: offsetY, left: offsetX }}
      {...listeners}
      {...attributes}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
}
