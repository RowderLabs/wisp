import React from "react";
import { DndContext, Modifier, MouseSensor, useSensor } from "@dnd-kit/core";
import { PropsWithChildren } from "react";
import { Transform, TransformEvent } from "./Transform";
import { useTransformContext, useTranslate } from "./hooks";
import { TextboxPanel } from "../panels";
import { Toolbar } from "./Toolbar";
import { HiMiniDocumentText, HiPhoto } from "react-icons/hi2";
import { HiTable } from "react-icons/hi";
import { Panel } from "@wisp/client/src/bindings";
import { rspc } from "@wisp/client";
import { ImagePanel } from "../panels/image";

type DraggableCanvasProps = {
  items: Panel[];
  createImage: () => void;
  onItemTransform: (event: TransformEvent) => void;
};

const snapToGrid: Modifier = (args) => {
  const { transform } = args;
  return {
    ...transform,
    x: Math.ceil(transform.x / 10) * 10,
    y: Math.ceil(transform.y / 10) * 10,
  };
};

function DraggableCanvasInner({ items, onItemTransform, createImage }: DraggableCanvasProps) {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { delay: 100, tolerance: 5 },
  });
  const queryClient = rspc.useContext().queryClient;
  const { mutate: setPanelContent } = rspc.useMutation(["panels.set_content"], {
    onSuccess: () => {
      queryClient.invalidateQueries(["panels.find"]);
    },
  });

  const { mutate: creatPanelDb } = rspc.useMutation(["panels.create"], {
    onSuccess: () => {
      queryClient.invalidateQueries(["panels.find"]);
    },
  });
  return (
    <div className="w-full h-full">
      <div className="absolute top-0 left-2">
        <Toolbar.Root orientation="vertical">
          <Toolbar.IconButton
            onClick={() =>
              creatPanelDb({
                x: Math.floor(Math.random() * (400 - 150 + 1)) + 150,
                y: Math.floor(Math.random() * (400 - 150 + 1)) + 150,
                width: 150,
                height: 200,
                content: null,
                panel_type: "textbox",
              })
            }
            icon={<HiMiniDocumentText />}
          />
          <Toolbar.IconButton onClick={() => createImage()} icon={<HiPhoto />} />
          <Toolbar.IconButton disabled={true} icon={<HiTable />} />
        </Toolbar.Root>
      </div>
      <DndContext sensors={[mouseSensor]}>
        {items.map((item) => (
          <Transform.Context
            id={item.id}
            key={item.id}
            transform={{ x: item.x, y: item.y, width: item.width, height: item.height }}
            onTransform={onItemTransform}
          >
            <DraggableCanvasItem>
              {item.panelType === "textbox"
                ? new TextboxPanel({
                    pluginOpts: { onChange: { debounce: { duration: 500 } } },
                    onChange: (editorState) => {
                      setPanelContent({
                        id: item.id,
                        content: JSON.stringify({ initial: editorState.toJSON() }),
                      });
                    },
                  }).renderFromJSON(item.content)
                : new ImagePanel({ fit: "cover" }).renderFromJSON(item.content)}
            </DraggableCanvasItem>
          </Transform.Context>
        ))}
      </DndContext>
    </div>
  );
}

export const DraggableCanvas = React.memo(DraggableCanvasInner);

interface DraggableCanvasItemProps extends PropsWithChildren {}

function DraggableCanvasItem({ children }: DraggableCanvasItemProps) {
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
