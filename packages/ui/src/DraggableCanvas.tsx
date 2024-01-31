import { DndContext, Modifier, MouseSensor, useSensor } from "@dnd-kit/core";
import { atom } from "jotai";
import { PropsWithChildren, useState } from "react";
import { Transform } from "./Transform";
import { molecule } from "bunshi/react";
import { useResize, useTransformContext } from "./hooks";
import { useRenderCount } from "@uidotdev/usehooks";

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
export function DraggableCanvas() {
  const mouseSensor = useSensor(MouseSensor);
  const [id, setId] = useState("hello");
  const [items, setItems] = useState(initItems);

  return (
    <div className="w-full h-full">
      <DndContext sensors={[mouseSensor]}>
        <CanvasItem
          id={id}
          transform={{ ...items[0] }}
          onTransform={(event) => {
            setItems([
              {
                id: event.id,
                x: event.x || items[0].x,
                y: event.y || items[0].y,
                width: event.width || items[0].width,
                height: event.height || items[0].height,
              },
            ]);
          }}
        >
          <Inner />
        </CanvasItem>
        <button onClick={() => setId("New id")}>Set Id</button>
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

function CanvasItem({
  children,
  id,
  transform,
  onTransform,
}: PropsWithChildren<{ id: string; transform: Transform; onTransform: (args: any) => void }>) {
  const renderCount = useRenderCount();
  return (
    <Transform.Context id={id} transform={transform} onTransform={onTransform}>
      {children}
      {renderCount}
    </Transform.Context>
  );
}

function Inner() {
  const { transform } = useTransformContext();
  return (
    <div
      className="w-48 h-48 bg-blue-400 absolute"
      style={{
        left: transform.x,
        top: transform.y,
        width: transform.width,
        height: transform.height,
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
