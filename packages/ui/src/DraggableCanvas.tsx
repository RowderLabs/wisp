import { DndContext, Modifier, MouseSensor, useSensor } from "@dnd-kit/core";
import { atom } from "jotai";
import { PropsWithChildren, useEffect, useState } from "react";
import { Transform, TransformEvent } from "./Transform";
import { molecule } from "bunshi/react";
import { useResize, useTransformContext, useTranslate } from "./hooks";
import { useRenderCount } from "@uidotdev/usehooks";
import React from "react";

type CanvasItem = {
  id: string;
} & Transform;

const CanvasMolecule = molecule((_, scope) => {
  const $canvasItems = atom<CanvasItem[]>([
    { id: "first", x: 0, y: 0, width: 150, height: 150 },
    { id: "second", x: 0, y: 0, width: 150, height: 150 },
    { id: "third", x: 0, y: 0, width: 400, height: 150 },
  ]);

  return { $canvasItems };
});
const initItems = [{ id: "1", x: 0, y: 0, width: 150, height: 150 }] as (Transform & {
  id: string;
})[];

type CanvasItemType = {
  id: string;
} & Transform;

type DraggableCanvasProps = {
  items: CanvasItemType[];
  onItemTransform: (event: TransformEvent) => void;
};

function DraggableCanvasInner({ items, onItemTransform }: DraggableCanvasProps) {
  const renderCount = useRenderCount();
  const mouseSensor = useSensor(MouseSensor);
  return (
    <div className="w-full h-full">
      <DndContext>
        {items.map((item) => (
          <CanvasItem
            id={item.id}
            key={item.id}
            transform={{ x: item.x, y: item.y, width: item.width, height: item.height }}
            onTransform={onItemTransform}
          >
            <MemoInner />
            {renderCount}
          </CanvasItem>
        ))}
      </DndContext>
    </div>
  );
}

export const DraggableCanvas = React.memo(DraggableCanvasInner)

const snapToGrid: Modifier = (args) => {
  const { transform } = args;
  return {
    ...transform,
    x: Math.ceil(transform.x / 10) * 10,
    y: Math.ceil(transform.y / 10) * 10,
  };
};

function CanvasItem({
  children,
  id,
  transform,
  onTransform,
}: PropsWithChildren<{ id: string; transform: Transform; onTransform: (args: any) => void }>) {
  React.useEffect(() => {
    console.count(JSON.stringify(transform))
  }, [transform])
  return (
    <Transform.Context id={id} transform={transform} onTransform={onTransform}>
      {children}
    </Transform.Context>
  );
}

function Inner() {
  const { transform } = useTransformContext();
  const { dragHandle, dragRef, translateStyles } = useTranslate();
  return (
    <div
      ref={dragRef}
      {...dragHandle.listeners}
      {...dragHandle.attributes}
      className="w-48 h-48 bg-blue-400 absolute"
      style={{
        left: transform.x,
        top: transform.y,
        width: transform.width,
        height: transform.height,
        ...translateStyles
      }}
    >
      <Transform.Resize
        activeHandles={{
          "bottom-left": true,
          "bottom-right": true,
          "top-left": true,
          "top-right": true,
        }}
        constraints={{ width: { min: 150 }, height: { min: 150 } }}
      />
    </div>
  );
}

const MemoInner = React.memo(Inner)