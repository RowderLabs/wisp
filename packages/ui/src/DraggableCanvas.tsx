import { DndContext, Modifier, MouseSensor, useSensor } from "@dnd-kit/core";
import { atom, useAtom } from "jotai";
import { WithRequired, useTransformContext } from "./hooks";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { PropsWithChildren, useEffect } from "react";
import {
  TransformHandles,
  TranslateHandle,
  ResizeHandle,
  Transform,
  TransformProps,
  TransformEndEvent,
} from "./Transform";
import { molecule, useMolecule } from "bunshi/react";
import { createPanel } from "./panels";

type CanvasItem = {
  id: string;
} & Transform;


export function DraggableCanvas({
  items,
  onItemTransform,
}: {
  items: any[];
  onItemTransform: (updated: WithRequired<Partial<CanvasItem>, "id">) => void;
}) {

  const mouseSensor = useSensor(MouseSensor);

  return (
    <div className="w-full h-full">
      <DndContext sensors={[mouseSensor]} modifiers={[snapToGrid]}>
        {items.map((item) => (
          <DraggableCanvasItem
            key={item.id}
            id={item.id}
            initial={{ x: item.x, y: item.y, width: item.width, height: item.height }}
            onTransformEnd={(e) => onItemTransform({ id: e.transformId, ...e })}
          >
            {createPanel("textbox", { title: "hello" }).content}
          </DraggableCanvasItem>
        ))}
      </DndContext>
    </div>
  );
}

const snapToGrid: Modifier = (args) => {
  const { transform } = args;
  return {
    ...transform,
    x: Math.ceil(transform.x / 10) * 10,
    y: Math.ceil(transform.y / 10) * 10,
  };
};

function CanvasItem({ children }: PropsWithChildren) {
  const { style, dragHandle, dragRef } = useTransformContext();
  return (
    <div ref={dragRef} style={{ ...style }} className="absolute rounded-md">
      {children}
      <TransformHandles>
        <TranslateHandle {...dragHandle} />
        <ResizeHandle position="top-right" />
        <ResizeHandle position="bottom-right" />
        <ResizeHandle position="bottom-left" />
        <ResizeHandle position="top-left" />
      </TransformHandles>
    </div>
  );
}

function DraggableCanvasItem({ children, ...props }: PropsWithChildren<TransformProps>) {
  return (
    <Transform {...props}>
      <CanvasItem>{children}</CanvasItem>
    </Transform>
  );
}
