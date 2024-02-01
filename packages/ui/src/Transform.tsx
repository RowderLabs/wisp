import { ScopeProvider, createScope } from "bunshi/react";
import React, { PropsWithChildren } from "react";
import { ResizeConstraints, useResize, useTransformContext } from "./hooks";
import { cva } from "class-variance-authority";
import { useDraggable } from "@dnd-kit/core";

export type Maybe<T extends unknown> = T extends object
  ? {
      [K in keyof T]: T[K] | undefined;
    }
  : T | undefined;

export type Transform = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface TransformEvent extends Transform {
  type: "RESIZE" | "TRANSLATE";
  id: string;
}

type TransformScopeType = {
  id: string;
  transform: Transform;
  onTransform: (event: TransformEvent) => void;
};

export type TransformProps = TransformScopeType & {};

export const TransformScope = createScope<TransformScopeType | undefined>(undefined);

const Context: React.FC<PropsWithChildren<TransformProps>> = ({ children, ...props }) => {
  return (
    <ScopeProvider scope={TransformScope} value={props}>
      {children}
    </ScopeProvider>
  );
};

export type HandlePosition = "bottom-left" | "top-left" | "bottom-right" | "top-right";
type ResizeProps = {
  constraints: ResizeConstraints;
  activeHandles: Record<HandlePosition, boolean>;
};

export function Resize({ constraints, activeHandles }: ResizeProps) {
  useResize({ constraints });

  return (
    <>
      {activeHandles["bottom-right"] && <ResizeHandle position="bottom-right" />}
      {activeHandles["bottom-left"] && <ResizeHandle position="bottom-left" />}
      {activeHandles["top-left"] && <ResizeHandle position="top-left" />}
      {activeHandles["top-right"] && <ResizeHandle position="top-right" />}
    </>
  );
}

const resizableHandleVariants = cva("absolute pointer-events-auto h-[20px] w-[20px] z-50", {
  variants: {
    position: {
      "bottom-left": "bottom-0.5 left-0.5 cursor-sw-resize",
      "bottom-right": "bottom-0.5 right-0.5 cursor-se-resize",
      "top-left": "top-0.5 left-0.5 cursor-nw-resize",
      "top-right": "top-0.5 right-0.5 cursor-ne-resize",
    },
  },
});
export function ResizeHandle({ position }: { position: HandlePosition }) {
  const { id: transformId } = useTransformContext();

  const { listeners, attributes, setNodeRef } = useDraggable({
    id: `${transformId}-resize-${position}`,
    data: {
      transform: {
        type: "resize",
        handlePosition: position,
      },
    },
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={resizableHandleVariants({ position })}
    ></div>
  );
}

export const Transform = { Context, Resize };
