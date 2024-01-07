import { DndContext, DragMoveEvent, useDraggable } from "@dnd-kit/core";
import { nanoid } from "nanoid";
import React, { Dispatch, PropsWithChildren, createContext, useContext, useEffect, useReducer, useRef } from "react";

type Maybe<T extends unknown> = T extends object
  ? {
      [K in keyof T]: T[K] | undefined;
    }
  : T | undefined;

type TransformContextType = {
  transformRef: React.MutableRefObject<HTMLDivElement | null>;
  width: Maybe<number>;
  height: Maybe<number>;
  onTranformEnd?: TransformEndEvent;
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

export const useTransform = (): Pick<TransformContextType, "x" | "y" | "width" | "height" | "transformRef"> => {
  return useTransformContext();
};

type TransformEndEvent = (event: Partial<Maybe<Transform>>) => void;

type TransformProps = {
  initial: Partial<Maybe<Transform>>;
  onTranformEnd?: TransformEndEvent;
};

type Transform = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type TransformState = Maybe<Transform> & {};
type TransformAction =
  | { type: "SET_X"; payload: number }
  | { type: "SET_Y"; payload: number }
  | { type: "SET_WIDTH"; payload: number }
  | { type: "SET_HEIGHT"; payload: number };

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
    default: {
      return state;
    }
  }
}

function Root({ children, onTranformEnd, initial }: PropsWithChildren<TransformProps>) {
  const transformRef = useRef<HTMLDivElement | null>(null);
  const [transformState, dispatch] = useReducer(transformReducer, {
    width: initial.width,
    height: initial.height,
    x: initial.x,
    y: initial.y,
  });

  useEffect(() => {
    if (transformRef.current) {
      dispatch({ type: "SET_WIDTH", payload: transformRef.current.getBoundingClientRect().width });
      dispatch({ type: "SET_HEIGHT", payload: transformRef.current.getBoundingClientRect().height });
    }
  }, [transformRef]);

  return (
    <TransformContext.Provider value={{ dispatch, onTranformEnd, transformRef, ...transformState }}>
      {children}
    </TransformContext.Provider>
  );
}

function Resize({ children }: PropsWithChildren) {
  const { width, height, dispatch, onTranformEnd } = useTransformContext();
  const dragStartWidth = useRef<Maybe<number>>();
  const dragStartHeight = useRef<Maybe<number>>();

  const resizeBottomRight = ({ delta }: DragMoveEvent) => {
    dispatch({ type: "SET_WIDTH", payload: dragStartWidth.current! + delta.x });
    dispatch({ type: "SET_HEIGHT", payload: dragStartHeight.current! + delta.y });
  };

  const setStartingDimensions = () => {
    dragStartWidth.current = width;
    dragStartHeight.current = height;
  };

  return (
    <DndContext
      onDragStart={setStartingDimensions}
      onDragMove={resizeBottomRight}
      onDragEnd={() => {
        if (onTranformEnd) onTranformEnd({ width, height });
      }}
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
