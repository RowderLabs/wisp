import { DndContext, MouseSensor, UniqueIdentifier, useDraggable, useSensor } from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import React, { PropsWithChildren, forwardRef, useImperativeHandle } from "react";
import { useState } from "react";
import { useCommandSystem } from "./hooks/useCommandSystem";
import { Resizable } from "./Resizable";

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
  deleteCanvasItem: (id: CanvasItem["id"]) => void;
  undo: () => void;
  redo: () => void;
};

export const DraggableCanvas = forwardRef<DraggableCanvasHandle, DraggableCanvasProps>(({ initialItems = [] }, ref) => {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { delay: 150, tolerance: 5 },
  });

  useImperativeHandle(ref, () => ({
    createCanvasItem: (item) => canvasSystem.executeCommand({ type: "CREATE_ITEM", payload: { item } }),
    deleteCanvasItem: (id) => canvasSystem.executeCommand({ type: "DELETE_ITEM", payload: { id } }),
    undo: () => canvasSystem.undo(),
    redo: () => canvasSystem.redo(),
  }));

  type CANVAS_ACTION =
    | { type: "CREATE_ITEM"; payload: { item: CanvasItem } }
    | { type: "DELETE_ITEM"; payload: { id: UniqueIdentifier } }
    | { type: "MOVE_ITEM"; payload: { item: CanvasItem } };

  const canvasReducer = (state: typeof initialItems, action: CANVAS_ACTION) => {
    switch (action.type) {
      case "CREATE_ITEM": {
        return [...state, action.payload.item];
      }
      case "DELETE_ITEM": {
        return state.filter((item) => item.id !== action.payload.id);
      }
      case "MOVE_ITEM": {
        const updatedItem = action.payload.item;
        return [...state.filter((item) => item.id !== updatedItem.id), updatedItem];
      }
      default:
        throw new Error("Unknown action");
    }
  };

  const canvasSystem = useCommandSystem(canvasReducer, initialItems);
  return (
    <DndContext
      sensors={[mouseSensor]}
      modifiers={[restrictToParentElement]}
      onDragEnd={({ active, delta }) => {
        const activeItem = canvasSystem.state.find((item) => item.id === active.id);
        if (!activeItem) return;

        const updated = {
          ...activeItem,
          x: activeItem.x + delta.x,
          y: activeItem.y + delta.y,
        };
        canvasSystem.executeCommand({ type: "MOVE_ITEM", payload: { item: updated } });
      }}
    >
      {canvasSystem.state.map((item) => (
        <DraggableItem key={item.id} offsetX={item.x} offsetY={item.y} id={item.id}>
            {item.renderItem ? item.renderItem() : <div className="w-[50px] h-[50px] bg-red-500a"></div>}
        </DraggableItem>
      ))}
    </DndContext>
  );
});

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
