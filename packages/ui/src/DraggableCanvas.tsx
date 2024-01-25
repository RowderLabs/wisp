import { DndContext, UniqueIdentifier } from "@dnd-kit/core";
import { useTransformContext } from "./hooks";
import { PropsWithChildren, useState } from "react";
import { TransformHandles, TranslateHandle, ResizeHandle, Transform, TransformProps } from "./Transform";
import { createPanel } from "./panels";

export function DraggableCanvas() {
  const [items, setItems] = useState<(Transform & { id: string })[]>([
    { id: "first", x: 0, y: 0, width: 150, height: 150 },
    { id: "second", x: 0, y: 0, width: 150, height: 150 },
  ]);
  return (
    <div className="w-full h-full border border-red-300">
      <DndContext>
        {items.map((item) => (
          <DraggableCanvasItem
            key={item.id}
            id={item.id}
            initial={{ x: item.x, y: item.y, width: item.width, height: item.height }}
            onTransformStart={(e) => {
              console.log(e)
            }}
            onTransformEnd={(e) => {
              console.log(e);
              setItems((old) => {
                return [
                  ...old.filter((item) => item.id !== e.transformId),
                  {
                    x: e.x || item?.x,
                    y: e.y || item?.y,
                    width: e.width || item?.width,
                    height: e.height || item?.height,
                    id: e.transformId,
                  },
                ] as (Transform & { id: string })[];
              });
            }}
          >
            {createPanel("textbox", { title: "hello" }).content}
          </DraggableCanvasItem>
        ))}
        <div className="border border-blue-400">{JSON.stringify(items)}</div>
      </DndContext>
    </div>
  );
}

function CanvasItem({ children }: PropsWithChildren) {
  const { style, translateHandle, translateRef } = useTransformContext();
  return (
    <div ref={translateRef} style={{ ...style }} className="absolute rounded-md">
      {children}
      <TransformHandles>
        <TranslateHandle {...translateHandle} />
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
