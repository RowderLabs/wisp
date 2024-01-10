import { atom, useAtomValue } from "jotai";
import { PropsWithChildren, useState } from "react";
import { Maybe } from "./Transform";
import { createScope, molecule, ScopeProvider, useMolecule } from "bunshi/react";
import {
  DraggableAttributes,
  DraggableSyntheticListeners,
  UniqueIdentifier,
  useDndMonitor,
  useDraggable,
} from "@dnd-kit/core";
import { cva } from "class-variance-authority";
import { HiOutlineArrowsPointingOut } from "react-icons/hi2";

import invariant from "tiny-invariant";

export type Transform = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type TransformScope = Partial<Transform> & { id: Maybe<string> } & Pick<
    TransformProps,
    "onTransformStart" | "onTransformEnd" | "id"
  >;
export const TransformScope = createScope<TransformScope | undefined>(undefined);

//transform context creator
export const TransformMolecule = molecule((_, scope) => {
  const initial = scope(TransformScope);
  const transformAtom = atom({ ...initial });
  invariant(
    initial?.id,
    "No transformId specified. You need this to identify what you are dragging."
  );
  const transformIdAtom = atom<Maybe<string>>(initial.id);
  const transformingAtom = atom(false);

  const optionalTransformAtom = atom(
    null,
    (_get, set, { x, y, width, height }: Partial<Transform>) => {
      set(transformAtom, {
        ..._get(transformAtom),
        ...(height && { height }),
        ...(width && { width }),
        ...(x && { x }),
        ...(y && { y }),
      });
    }
  );
  return {
    optionalTransformAtom,
    transformAtom,
    transformIdAtom,
    transformingAtom,
    onTransformEnd: initial.onTransformEnd,
    onTransformStart: initial.onTransformStart,
  };
});

interface TransformEvent extends Maybe<Transform> {
  transformId: string;
}
interface TransformEndEvent extends TransformEvent {}
interface TransformStartEvent extends TransformEvent {}

type TransformProps = {
  id: string;
  onTransformStart?: (event: TransformStartEvent) => void;
  onTransformEnd?: (event: TransformEndEvent) => void;
  initial?: Partial<Transform>;
};
export const JotaiTransform = ({
  children,
  onTransformEnd,
  onTransformStart,
  id,
  initial = { width: undefined, height: undefined, x: undefined, y: undefined },
}: PropsWithChildren<TransformProps>) => {
  return (
    <ScopeProvider scope={TransformScope} value={{ ...initial, id, onTransformEnd, onTransformStart }}>
      {children}
    </ScopeProvider>
  );
};

type HandlePosition = "bottom-left" | "top-left" | "bottom-right" | "top-right";
type ResizableHandleProps = {
  position: HandlePosition;
};

const resizableHandleVariants = cva(
  "absolute pointer-events-auto h-[14px] w-[14px] z-50 rounded-full bg-slate-300",
  {
    variants: {
      position: {
        "bottom-left": "-bottom-1 -left-1",
        "bottom-right": "-bottom-1 -right-1",
        "top-left": "-top-1 -left-1",
        "top-right": "-top-1 -right-1",
      },
      cursor: {
        resize: "cursor-nw-resize",
        default: "cursor-pointer",
      },
    },
  }
);

export function JotaiResizeHandle({ position }: ResizableHandleProps) {
  const { transformIdAtom } = useMolecule(TransformMolecule);
  const transformId = useAtomValue(transformIdAtom);
  invariant(
    transformId,
    `No transform id for resize handle with position: ${position}. Make sure that your handles are only placed inside a <Transform/>`
  );
  const { listeners, attributes } = useDraggable({
    id: `${transformId}-resize-${position}`,
    data: {
      transform: {
        type: "resize",
        handlePosition: position,
      },
    },
  });
  return (
    <div {...listeners} {...attributes} className={resizableHandleVariants({ position })}></div>
  );
}

type TranslateHandleProps = {
  listeners?: DraggableSyntheticListeners;
  attributes?: DraggableAttributes;
};

export function JotaiTranslateHandle({ listeners, attributes }: TranslateHandleProps) {
  return (
    <div
      className="absolute -top-12 text-lg rounded-full w-full p-2 border "
      {...listeners}
      {...attributes}
    >
      <HiOutlineArrowsPointingOut />
    </div>
  );
}