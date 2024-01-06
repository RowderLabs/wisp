import { DndContext, DragMoveEvent, useDraggable } from "@dnd-kit/core";
import { useMeasure } from "@uidotdev/usehooks";
import { nanoid } from "nanoid";
import React, {
  PropsWithChildren,
  RefCallback,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type TransformContextType = {
  transformRef: React.MutableRefObject<HTMLDivElement | null>;
  width: number | null;
  height: number | null;
  onTranformEnd: TransformEndEvent;
  x: number | null;
  y: number | null;
  setWidth: React.Dispatch<SetStateAction<number | null>>;
  setHeight: React.Dispatch<SetStateAction<number | null>>;
  setX: React.Dispatch<SetStateAction<number | null>>;
  setY: React.Dispatch<SetStateAction<number | null>>;
};

const TransformContext = createContext<TransformContextType | null>(null);

export const useTransformContext = () => {
  const context = useContext(TransformContext);
  if (!context) throw new Error("No resize context defined");
  return context as TransformContextType;
};

type TransformEndEvent = (
  event: Partial<{ x: number; y: number; width: number | null; height: number | null }>
) => void;

type TransformProps = {
  initialWidth: number | null,
  initialHeight: number | null;
  onTranformEnd: TransformEndEvent;
};

function Root({ children, onTranformEnd, initialHeight = null, initialWidth = null }: PropsWithChildren<TransformProps>) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number | null>(initialWidth);
  const [height, setHeight] = useState<number | null>(initialHeight);
  const [x, setX] = useState<number | null>(null);
  const [y, setY] = useState<number | null>(null);

  useEffect(() => {
    if (ref.current) {
      setWidth(ref.current.getBoundingClientRect().width);
      setHeight(ref.current.getBoundingClientRect().height);
    }
  }, [ref]);

  return (
    <TransformContext.Provider
      value={{ onTranformEnd, setHeight, setWidth, transformRef: ref, width, height, x, y, setX, setY }}
    >
      {children}
    </TransformContext.Provider>
  );
}

function Resize({ children }: PropsWithChildren) {
  const { width, height, setWidth, setHeight, onTranformEnd } = useTransformContext();
  const dragStartWidth = useRef<number | null>(null);
  const dragStartHeight = useRef<number | null>(null);

  const resizeBottomRight = ({ delta }: DragMoveEvent) => {
    setWidth(dragStartWidth.current! + delta.x);
    setHeight(dragStartHeight.current! + delta.y);
  };

  const setStartingDimensions = () => {
    dragStartWidth.current = width;
    dragStartHeight.current = height;
  };

  return (
    <DndContext
      onDragStart={setStartingDimensions}
      onDragMove={resizeBottomRight}
      onDragEnd={() => onTranformEnd({ width, height })}
    >
      {children}
    </DndContext>
  );
}

function Translate() {}

function ResizeHandle() {
  const { listeners, attributes, setNodeRef } = useDraggable({
    id: nanoid(3),
    data: {
      handleType: "resize",
      position: "bottom-right",
    },
  });
  return (
    <div
      {...listeners}
      {...attributes}
      ref={setNodeRef}
      className="absolute z-50 w-6 h-6 rounded-full -bottom-2 -right-2 bg-blue-200"
    ></div>
  );
}

export const Transform = { Root, Resize, Translate, ResizeHandle };
