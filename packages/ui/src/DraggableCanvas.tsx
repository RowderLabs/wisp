import { DndContext, Modifier, MouseSensor, useSensor } from "@dnd-kit/core";
import { atom, useAtom } from "jotai";
import { useTransformContext } from "./hooks";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { PropsWithChildren } from "react";
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

const CanvasMolecule = molecule((_, scope) => {
  const $canvasItems = atom<CanvasItem[]>([
    { id: "first", x: 0, y: 0, width: 150, height: 150 },
    { id: "second", x: 0, y: 0, width: 150, height: 150 },
    { id: "third", x: 0, y: 0, width: 400, height: 150 },
  ]);

  return { $canvasItems };
});

const useDraggableCanvas = () => {
  const { $canvasItems } = useMolecule(CanvasMolecule);
  const [canvasItems, setCanvasItems] = useAtom($canvasItems);

  const updateCanvas = (e: TransformEndEvent) => {
    setCanvasItems((items) => {
      return items.reduce<CanvasItem[]>((acc, curr) => {
        curr.id === e.transformId
          ? acc.push({
              x: e.x || curr?.x,
              y: e.y || curr?.y,
              width: e.width || curr?.width,
              height: e.height || curr?.height,
              id: e.transformId,
            })
          : acc.push(curr);

        return acc;
      }, []);
    });
  };

  return {
    canvasItems,
    updateCanvas,
  };
};

export function DraggableCanvas() {
  const { canvasItems, updateCanvas } = useDraggableCanvas();

  const mouseSensor = useSensor(MouseSensor);

  return (
    <div className="w-full h-full">
      <DndContext sensors={[mouseSensor]} modifiers={[snapToGrid]}>
        {canvasItems.map((item) => (
          <DraggableCanvasItem
            key={item.id}
            id={item.id}
            initial={{ x: item.x, y: item.y, width: item.width, height: item.height }}
            onTransformEnd={updateCanvas}
          >
            {createPanel("textbox", { title: "hello" }).content}
          </DraggableCanvasItem>
        ))}
      </DndContext>
      <div>
        {JSON.stringify(canvasItems)}
      </div>
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
