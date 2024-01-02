import {
  DndContext,
  useDraggable,
} from "@dnd-kit/core";
import { cva } from "class-variance-authority";
import { nanoid } from "nanoid";
import { PropsWithChildren, useRef } from "react";
import invariant from "tiny-invariant";

export function DragResizer({}: PropsWithChildren) {
  const resizable = useRef<HTMLDivElement | null>(null);
  const startDim = useRef<{ width: number; height: number }>();
  const lastHandlePos = useRef<ResizableHandleProps['position']>()
  const startPos = useRef<{ x: number; y: number }>();

  return (
    <DndContext
      onDragStart={({active}) => {
        invariant(active.data.current && active.data.current.position, "handle position not found")
        lastHandlePos.current = active.data.current.position
        startDim.current = {
          width: resizable.current!.getBoundingClientRect().width,
          height: resizable.current!.getBoundingClientRect().height,
        };
        startPos.current = {
          x: resizable.current!.getBoundingClientRect().x,
          y: resizable.current!.getBoundingClientRect().y,
        };
      }}
      onDragMove={({ delta }) => {
        if (lastHandlePos.current === "bottom-right") {
          resizable.current!.style.width = startDim.current!.width + delta.x + "px";
          resizable.current!.style.height = startDim.current!.height + delta.y + "px";
        } else if (lastHandlePos.current === "bottom-left") {
          resizable.current!.style.width = startDim.current!.width - delta.x + "px";
          resizable.current!.style.height = startDim.current!.height + delta.y + "px";
          resizable.current!.style.left = startPos.current!.x + delta.x + "px";
        }
        else if(lastHandlePos.current === 'top-left') {
          resizable.current!.style.width = startDim.current!.width - delta.x + "px";
          resizable.current!.style.height = startDim.current!.height - delta.y + "px";
          resizable.current!.style.left = startPos.current!.x + delta.x + "px";
          resizable.current!.style.top = startPos.current!.y + delta.y + "px";
        } 
        else {
          resizable.current!.style.width = startDim.current!.width + delta.x + "px";
          resizable.current!.style.height = startDim.current!.height - delta.y + "px";
          resizable.current!.style.top = startPos.current!.y + delta.y + "px";
        }
      }}
    >
      <div className="border absolute pointer-events-none min-w-[50px] min-h-[50px]" ref={resizable}>
        <span className="pointer-events-auto">
          <DragResizeHandle position="bottom-left" />
          <DragResizeHandle position="top-right" />
          <DragResizeHandle position="bottom-right" />
          <DragResizeHandle position="top-left" />
        </span>
      </div>
    </DndContext>
  );
}

type ResizableHandleProps = {
  position: "bottom-left" | "top-left" | "bottom-right" | "top-right";
};

const resizableHandleVariants = cva("absolute pointer-events-auto h-4 w-4 z-50 rounded-full bg-blue-200", {
  variants: {
    position: {
      "bottom-left": "bottom-[-8px] left-[-8px]",
      "bottom-right": "bottom-[-8px] right-[-8px]",
      "top-left": "top-[-8px] left-[-8px]",
      "top-right": "top-[-8px] right-[-8px]",
    },
    cursor: {
      resize: "cursor-nw-resize",
      default: "cursor-pointer",
    },
  },
});

function DragResizeHandle({ position }: ResizableHandleProps) {
  const { attributes, listeners } = useDraggable({
    data: {
      position,
    },
    id: nanoid(1),
  });

  return <div {...attributes} {...listeners} className={resizableHandleVariants({ position })}></div>;
}
