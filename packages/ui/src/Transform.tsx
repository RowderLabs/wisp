import { DndContext, DragMoveEvent, useDraggable, DragEndEvent, useDndMonitor } from "@dnd-kit/core";
import { useIsFirstRender } from "@uidotdev/usehooks";
import { cva } from "class-variance-authority";
import { nanoid } from "nanoid";
import React, { Dispatch, PropsWithChildren, createContext, useContext, useEffect, useReducer, useRef } from "react";

export type Maybe<T extends unknown> = T extends object
  ? {
      [K in keyof T]: T[K] | undefined;
    }
  : T | undefined;

interface TransformEvent extends Partial<Maybe<Transform>> {}
interface TransformStartEvent extends TransformEvent {}
interface TransformEndEvent extends TransformEvent {}

type TransformContextType = {
  transformRef: React.MutableRefObject<HTMLDivElement | null>;
  onTransformStart?: (event: TransformStartEvent) => void;
  onTransformEnd?: (event: TransformEndEvent) => void;
  status: TransformStatus;
  width: Maybe<number>;
  height: Maybe<number>;
  x: Maybe<number>;
  y: Maybe<number>;
  dispatch: Dispatch<TransformAction>;
};

const TransformContext = createContext<TransformContextType | null>(null);

export const useTransformContext = () => {
  const context = useContext(TransformContext);
  if (!context) throw new Error("No resize context defined");
  return context as TransformContextType;
};

export const useTransform = (): Pick<
  TransformContextType,
  "x" | "y" | "width" | "height" | "transformRef" | "status"
> => {
  return useTransformContext();
};

type TransformProps = {
  initial: Partial<Maybe<Transform>>;
  onTransformStart?: (event: TransformEndEvent) => void;
  onTranformEnd?: (event: TransformEndEvent) => void;
  onTransform?: (event: TransformEvent) => void;
};

type Transform = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type TransformType = Maybe<"TRANSLATE" | "RESIZE">;
type TransformStatus = { active: boolean; type: TransformType };

type TransformState = Maybe<Transform> & {
  status: TransformStatus;
};
type TransformAction =
  | { type: "SET_X"; payload: number }
  | { type: "SET_Y"; payload: number }
  | { type: "SET_WIDTH"; payload: number }
  | { type: "SET_HEIGHT"; payload: number }
  | { type: "START_TRANSFORM"; payload: TransformType }
  | { type: "END_TRANSFORM" };

function transformReducer(state: TransformState, action: TransformAction): TransformState {
  switch (action.type) {
    case "SET_WIDTH": {
      return { ...state, width: action.payload };
    }
    case "SET_HEIGHT": {
      return { ...state, height: action.payload };
    }
    case "SET_X": {
      return { ...state, x: action.payload };
    }
    case "SET_Y": {
      return { ...state, y: action.payload };
    }
    case "START_TRANSFORM": {
      return { ...state, status: { active: true, type: action.payload } };
    }
    case "END_TRANSFORM": {
      return { ...state, status: { active: false, type: undefined } };
    }
    default: {
      return state;
    }
  }
}

function Root({ children, onTranformEnd, onTransformStart, onTransform, initial }: PropsWithChildren<TransformProps>) {
  const transformRef = useRef<HTMLDivElement | null>(null);
  const isFirstRender = useIsFirstRender();
  const [transformState, dispatch] = useReducer(transformReducer, {
    status: { active: false, type: undefined },
    width: initial.width,
    height: initial.height,
    x: initial.x || 0,
    y: initial.y || 0,
  });

  useEffect(() => {
    if (isFirstRender) return;

    if (transformState.status.active && onTransform) {
      onTransform(transformState);
    }
    if (!transformState.status.active && onTranformEnd) {
      onTranformEnd(transformState);
    }
  }, [transformState]);

  useEffect(() => {
    if (transformRef.current) {
      dispatch({ type: "SET_WIDTH", payload: transformRef.current.getBoundingClientRect().width });
      dispatch({ type: "SET_HEIGHT", payload: transformRef.current.getBoundingClientRect().height });
    }
  }, [transformRef]);

  return (
    <TransformContext.Provider value={{ dispatch, transformRef, ...transformState }}>
      <DndContext onDragEnd={() => dispatch({ type: "END_TRANSFORM" })}>{children}</DndContext>
    </TransformContext.Provider>
  );
}

function Translate({children}: PropsWithChildren) {
  const { x, y, dispatch, status } = useTransformContext();

  useDndMonitor({
    onDragStart: ({ active }) => {
      if (!active.data.current || active.data.current.transform.type !== "translate") return;
      dispatch({ type: "START_TRANSFORM", payload: "TRANSLATE" });
    },
    onDragEnd: ({ delta }) => {
      if (status.type !== "TRANSLATE") return;
      dispatch({ type: "SET_X", payload: x! + delta.x });
      dispatch({ type: "SET_Y", payload: y! + delta.y });
    },
  });

  return children
}

function TranslateHandle() {
  const { listeners, attributes, setNodeRef } = useDraggable({
    id: nanoid(3),
    data: {
      transform: {
        type: "translate",
      },
    },
  });
  return (
    <div
      {...listeners}
      {...attributes}
      ref={setNodeRef}
      className={resizableHandleVariants({ position: "top-left" })}
    ></div>
  );
}
function Resize({ children }: PropsWithChildren) {
  const { width, height, dispatch, status } = useTransformContext();
  const dragStartWidth = useRef<Maybe<number>>();
  const dragStartHeight = useRef<Maybe<number>>();

  const resizeBottomRight = ({ delta }: Pick<DragMoveEvent, "delta">) => {
    dispatch({ type: "SET_WIDTH", payload: dragStartWidth.current! + delta.x });
    dispatch({ type: "SET_HEIGHT", payload: dragStartHeight.current! + delta.y });
  };

  const setStartingDimensions = () => {
    dragStartWidth.current = width;
    dragStartHeight.current = height;
  };

  useDndMonitor({
    onDragStart: ({ active }) => {
      if (!active.data.current || active.data.current.transform.type !== "resize") return;
      dispatch({ type: "START_TRANSFORM", payload: "RESIZE" });
      setStartingDimensions();
    },
    onDragMove: ({ delta }) => {
      if (status.type !== "RESIZE") return;
      resizeBottomRight({ delta });
    },
  });

  return children;
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

function ResizeHandle({ position }: ResizableHandleProps) {
  const { listeners, attributes, setNodeRef } = useDraggable({
    id: nanoid(3),
    data: {
      transform: {
        type: "resize",
        handlePosition: position,
      },
    },
  });
  return <div {...listeners} {...attributes} ref={setNodeRef} className={resizableHandleVariants({ position })}></div>;
}

export const Transform = { Root, Resize, Translate, ResizeHandle, TranslateHandle };
