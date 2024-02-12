import React from "react";
import { DndContext, Modifier, MouseSensor, useSensor } from "@dnd-kit/core";
import { PropsWithChildren } from "react";
import { Transform, TransformEvent } from "./Transform";
import { useTransformContext, useTranslate } from "./hooks";
import { TextboxPanel } from "../panels";
import { HiOutlineClipboardDocument, HiOutlineSquare3Stack3D, HiTrash } from "react-icons/hi2";
import { Panel } from "@wisp/client/src/bindings";
import { rspc } from "@wisp/client";
import { ImagePanel } from "../panels/image";
import { ContextMenu } from "./ContextMenu";
import { d } from "@tauri-apps/api/path-c062430b";

type DraggableCanvasProps = {
  id: string;
  items: Panel[];
  onItemTransform: (event: TransformEvent) => void;
  onItemDelete: (id: string) => void;
  modifiers?: Modifier[];
};

function DraggableCanvasInner({
  items,
  onItemTransform,
  onItemDelete,
  modifiers,
  children,
}: PropsWithChildren<DraggableCanvasProps>) {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { delay: 100, tolerance: 5 },
  });

  const queryClient = rspc.useContext().queryClient;
  const { mutate: setPanelContent } = rspc.useMutation(["panels.set_content"], {
    onSuccess: () => {
      queryClient.invalidateQueries(["characters.canvas"]);
    },
  });

  return (
    <div className="w-full h-full">
      {children}
      <DndContext modifiers={modifiers} sensors={[mouseSensor]}>
        {items.map((item) => (
          <Transform.Context
            id={item.id}
            key={item.id}
            transform={{ x: item.x, y: item.y, width: item.width, height: item.height }}
            onTransform={onItemTransform}
          >
            <DraggableCanvasItem onDelete={onItemDelete}>
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

interface DraggableCanvasItemProps extends PropsWithChildren {
  onDelete?: (id: string) => void;
}

function DraggableCanvasItem({ children, onDelete }: DraggableCanvasItemProps) {
  const { transform, id } = useTransformContext();
  const { dragHandle, dragRef, translateStyles } = useTranslate();
  return (
    <ContextMenu.Root
      className="text-xs"
      trigger={
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
