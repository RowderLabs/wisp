import {
  DndContext,
  DragMoveEvent,
  useDraggable,
  DragEndEvent,
  useDndMonitor,
  useSensor,
  MouseSensor,
} from "@dnd-kit/core";
import { useIsFirstRender } from "@uidotdev/usehooks";
import { cva } from "class-variance-authority";
import { nanoid } from "nanoid";
import type { ClientRect, Modifier, UniqueIdentifier } from "@dnd-kit/core";
import React, {
  Dispatch,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { restrictToParentElement } from "@dnd-kit/modifiers";

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

export const useTransform = () => {
  const { x, y, width, height, transformRef } = useTransformContext() as Pick<
    TransformContextType,
    "width" | "height" | "x" | "y" | "transformRef"
  >;
  const transformStyles: React.CSSProperties = {
    left: x,
    top: y,
    width,
    height,
  };

  return { transformStyles, transformRef };
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

  const mouseSensor = useSensor(MouseSensor);
  const [modifiers, setModifiers] = useState<Modifier[]>();

  return (
    <TransformContext.Provider value={{ dispatch, transformRef, ...transformState }}>
      <DndContext
        sensors={[mouseSensor]}
        modifiers={modifiers}
        onDragStart={({ active }) => {
          if (active.data.current && active.data.current.modifiers) {
            setModifiers(active.data.current.modifiers);
          }
        }}
        onDragEnd={() => dispatch({ type: "END_TRANSFORM" })}
      >
        {children}
      </DndContext>
    </TransformContext.Provider>
  );
}

export function useTranslate() {
  const { x, y, dispatch, status } = useTransformContext();

  const isTranslating = status.type === "TRANSLATE";

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
  return { isTranslating };
}

function TranslateHandle() {
  const { listeners, attributes, setNodeRef } = useDraggable({
    id: 2,
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
      className={resizableHandleVariants({ position: "top-right" })}
    ></div>
  );
}

type UseResizableArgs = {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
};
export function useResizable(
  { minWidth, maxWidth, minHeight, maxHeight }: UseResizableArgs = {
    minWidth: 50,
    maxWidth: 300,
    minHeight: 50,
    maxHeight: 300,
  }
) {
  const { width, height, dispatch, status, x, y } = useTransformContext();
  const dragStartWidth = useRef<Maybe<number>>();
  const dragStartHeight = useRef<Maybe<number>>();
  const dragStartX = useRef<Maybe<number>>();
  const dragStartY = useRef<Maybe<number>>();
  const [handlePosition, setHandlePosition] = useState<ResizableHandleProps["position"]>();

  const isResizing = useMemo(() => status.type === "RESIZE", [status]);
  const canScaleX = (projectedWidth: number) => {
    return projectedWidth > minWidth! && projectedWidth < maxWidth!;
  };
  const canScaleY = (projectedHeight: number) => {
    return projectedHeight > minHeight! && projectedHeight < maxHeight!;
  };

  const resizeBottomRight = ({ delta }: Pick<DragMoveEvent, "delta">) => {
    const projectedWidth = dragStartWidth.current! + delta.x;
    const projectedHeight = dragStartHeight.current! + delta.y;
    if (canScaleX(projectedWidth)) {
      dispatch({ type: "SET_WIDTH", payload: projectedWidth });
    }
    if (canScaleY(projectedHeight)) {
      dispatch({ type: "SET_HEIGHT", payload: projectedHeight });
    }
  };

  const resizeTopLeft = ({ delta }: Pick<DragMoveEvent, "delta">) => {
    const projectedWidth = dragStartWidth.current! - delta.x;
    const projectedHeight = dragStartHeight.current! - delta.y;
    if (canScaleX(projectedWidth)) {
      dispatch({ type: "SET_WIDTH", payload: projectedWidth });
      dispatch({ type: "SET_X", payload: dragStartX.current! + delta.x });
    }

    if (canScaleY(projectedHeight)) {
      dispatch({ type: "SET_HEIGHT", payload: projectedHeight });
      dispatch({ type: "SET_Y", payload: dragStartY.current! + delta.y });
    }
  };

  const setStartingDimensions = () => {
    dragStartWidth.current = width;
    dragStartHeight.current = height;
  };

  const setStartingPosition = () => {
    dragStartX.current = x;
    dragStartY.current = y;
  };

  useDndMonitor({
    onDragStart: ({ active }) => {
      if (!active.data.current || active.data.current.transform.type !== "resize") return;
      dispatch({ type: "START_TRANSFORM", payload: "RESIZE" });
      setHandlePosition(active.data.current.transform.handlePosition)
      setStartingDimensions();
      setStartingPosition();
    },
    onDragMove: ({ delta }) => {
      if (status.type !== "RESIZE") return;
      if (handlePosition === "bottom-right") resizeBottomRight({ delta });
      if (handlePosition === "top-left") resizeTopLeft({ delta });
    },
  });

  return { isResizing, handlePosition };
}

export type HandlePosition = "bottom-left" | "top-left" | "bottom-right" | "top-right"

type ResizableHandleProps = {
  id: UniqueIdentifier
  position: HandlePosition;
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

function ResizeHandle({ position, id }: ResizableHandleProps) {
  const { transformRef } = useTransformContext();

  const restrictToAncestor: Modifier = (e) => {
    return restrictToParentElement({
      ...e,
      containerNodeRect: transformRef.current?.parentElement?.getBoundingClientRect() as ClientRect,
    });
  };
  const { listeners, attributes, setNodeRef } = useDraggable({
    id,
    data: {
      modifiers: [restrictToAncestor],
      transform: {
        type: "resize",
        handlePosition: position,
      },
    },
  });
  return <div {...listeners} {...attributes} ref={setNodeRef} className={resizableHandleVariants({ position })}></div>;
}

export const Transform = { Root, ResizeHandle, TranslateHandle };
