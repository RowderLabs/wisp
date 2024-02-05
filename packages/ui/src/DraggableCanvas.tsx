import { DndContext, Modifier, MouseSensor, useSensor } from "@dnd-kit/core";
import { PropsWithChildren } from "react";
import { Transform, TransformEvent, TransformProps } from "./Transform";
import { useTransformContext, useTranslate } from "./hooks";
import React from "react";
import { createPanel } from "./panels";
import { Toolbar } from "./Toolbar";
import { HiMiniDocumentText, HiPhoto } from "react-icons/hi2";
import { HiTable } from "react-icons/hi";


type CanvasItemType = {
  id: string;
} & Transform;

type DraggableCanvasProps = {
  items: CanvasItemType[];
  onItemTransform: (event: TransformEvent) => void;
};

function DraggableCanvasInner({ items, onItemTransform }: DraggableCanvasProps) {
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { delay: 100, tolerance: 5 } });
  return (
    <div className="w-full h-full">
      <div className="absolute top-0 left-2">
        <Toolbar.Root orientation="vertical">
          <Toolbar.IconButton icon={<HiMiniDocumentText />} />
          <Toolbar.IconButton icon={<HiPhoto />} />
          <Toolbar.IconButton disabled={true} icon={<HiTable />} />
        </Toolbar.Root>
      </div>
      <DndContext sensors={[mouseSensor]}>
        {items.map((item) => (
          <DraggableCanvasItem
            id={item.id}
            key={item.id}
            transform={{ x: item.x, y: item.y, width: item.width, height: item.height }}
            onTransform={onItemTransform}
          >
            {createPanel('textbox', {title: "hello world"}).content}
          </DraggableCanvasItem>
        ))}
      </DndContext>
    </div>
  );
}

export const DraggableCanvas = React.memo(DraggableCanvasInner);

const snapToGrid: Modifier = (args) => {
  const { transform } = args;
  return {
    ...transform,
    x: Math.ceil(transform.x / 10) * 10,
    y: Math.ceil(transform.y / 10) * 10,
  };
};

interface DraggableCanvasItemProps extends PropsWithChildren, CanvasItemProps, TransformProps {}

function DraggableCanvasItem({
  id,
  children,
  transform,
  onTransform,
}: DraggableCanvasItemProps) {
  return (
    <Transform.Context id={id} transform={transform} onTransform={onTransform}>
      <CanvasItem>
        {children}
      </CanvasItem>
    </Transform.Context>
  );
}

interface CanvasItemProps {

}

function CanvasItem({ children }: PropsWithChildren) {
  const { transform } = useTransformContext();
  const { dragHandle, dragRef, translateStyles } = useTranslate();
  return (
    <div
      ref={dragRef}
      {...dragHandle.listeners}
      {...dragHandle.attributes}
      className="rounded-md absolute"
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
        constraints={{ width: { min: 150 }, height: { min: 150 } }}
      />
      {children}
    </div>
  );
}
