import React, { useRef } from "react";
import { DndContext, Modifier, MouseSensor, useSensor } from "@dnd-kit/core";
import { PropsWithChildren } from "react";
import { Transform, TransformEvent } from "./Transform";
import { useClickExact, useTransformContext, useTranslate } from "./hooks";
import { HiOutlineClipboardDocument, HiOutlineSquare3Stack3D, HiTrash } from "react-icons/hi2";
import { ContextMenu } from "./ContextMenu";
import clsx from "clsx";

interface DraggablCanvasItemType {
  id: string,
  x: number,
  y: number,
  width: number,
  height: number
}
type DraggableCanvasProps<T extends DraggablCanvasItemType>  = {
  id: string;
  items: T[];
  selected: string | undefined,
  onSelectionChange: (id: string | undefined) => void;
  renderItem: (item: T) => React.ReactNode;
  onItemTransform: (event: TransformEvent) => void;
  onItemDelete: (id: string) => void;
  modifiers?: Modifier[];
};

export function DraggableCanvas<T extends DraggablCanvasItemType>({
  items,
  selected,
  onItemTransform,
  onItemDelete,
  onSelectionChange,
  modifiers,
  renderItem,
  children,
}: PropsWithChildren<DraggableCanvasProps<T>>) {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 0.01 },
  });

  
  const canvasRef = useRef<HTMLDivElement>(null)
  useClickExact(canvasRef, () => onSelectionChange(undefined))

  return (
    <div ref={canvasRef} className="w-full h-full">
      <DndContext modifiers={modifiers} sensors={[mouseSensor]}>
        {children}
        {items.map((item) => (
          <Transform.Context
            id={item.id}
            key={item.id}
            transform={{ x: item.x, y: item.y, width: item.width, height: item.height }}
            onTransform={onItemTransform}
          >
            <DraggableCanvasItem
              selected={selected === item.id}
              canMove={selected !== item.id}
              onSelect={(id) => onSelectionChange(id)}
              onDelete={onItemDelete}
            >
              {renderItem(item)}
            </DraggableCanvasItem>
          </Transform.Context>
        ))}
      </DndContext>
    </div>
  );
}


interface DraggableCanvasItemProps extends PropsWithChildren {
  onDelete?: (id: string) => void;
  selected: boolean;
  canMove: boolean;
  onSelect: (id: string) => void;
}

function DraggableCanvasItem({ children, onDelete, selected, onSelect, canMove}: DraggableCanvasItemProps) {
  const { transform, id } = useTransformContext();
  const { dragHandle, dragRef, translateStyles } = useTranslate({canMove});
  return (
    <ContextMenu.Root
      className="text-xs"
      trigger={
        <div
          onDoubleClick={(e) => {
            e.preventDefault()
            onSelect(id)
          }}
          ref={dragRef}
          {...dragHandle.listeners}
          {...dragHandle.attributes}
          className={clsx("rounded-md absolute", selected && "outline outline-emerald-500")}
          style={{
            left: transform.x,
            top: transform.y,
            width: transform.width,
            height: transform.height,
            ...translateStyles,
          }}
        >
          <Transform.Resize
            activeHandles={{
              "bottom-left": true,
              "bottom-right": true,
              "top-left": true,
              "top-right": true,
            }}
            constraints={{ width: { min: 200 }, height: { min: 200 } }}
          />
          {children}
        </div>
      }
    >
      <ContextMenu.Item disabled={true} icon={<HiOutlineClipboardDocument />}>
        Duplicate
      </ContextMenu.Item>
      <ContextMenu.Item disabled={true} icon={<HiOutlineSquare3Stack3D />}>
        Send to front
      </ContextMenu.Item>
      <ContextMenu.Item disabled={true} icon={<HiOutlineSquare3Stack3D />}>
        Send to back
      </ContextMenu.Item>
      <ContextMenu.Separator />
      {onDelete && (
        <ContextMenu.Item onClick={() => onDelete(id)} icon={<HiTrash />}>
          Delete
        </ContextMenu.Item>
      )}
    </ContextMenu.Root>
  );
}
