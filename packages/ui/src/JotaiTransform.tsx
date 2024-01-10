import { atom, useAtomValue } from "jotai";
import { PropsWithChildren } from "react";
import { Maybe } from "./Transform";
import { createScope, molecule, ScopeProvider, useMolecule } from "bunshi/react";
import { DraggableAttributes, DraggableSyntheticListeners, UniqueIdentifier, useDraggable } from "@dnd-kit/core";
import { cva } from "class-variance-authority";
import { useTransform } from "./hooks";
import invariant from "tiny-invariant";

export type Transform = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const TransformScope = createScope<Partial<Transform> & { id: Maybe<UniqueIdentifier> }>({
  id: undefined,
  x: undefined,
  y: undefined,
  width: undefined,
  height: undefined,
});

//transform context creator
export const TransformMolecule = molecule((_, scope) => {
  const initial = scope(TransformScope);
  const transformAtom = atom({ ...initial });
  const transformIdAtom = atom<Maybe<UniqueIdentifier>>(initial.id);

  const optionalTransformAtom = atom(null, (_get, set, { x, y, width, height }: Partial<Transform>) => {
    set(transformAtom, {
      ..._get(transformAtom),
      ...(height && { height }),
      ...(width && { width }),
      ...(x && { x }),
      ...(y && { y }),
    });
  });
  return { optionalTransformAtom, transformAtom, transformIdAtom };
});

type TransformProps = {
  id: UniqueIdentifier;
  initial?: Partial<Transform>;
};
export const JotaiTransform = ({
  children,
  id,
  initial = { width: undefined, height: undefined, x: undefined, y: undefined },
}: PropsWithChildren<TransformProps>) => {
  return (
    <ScopeProvider scope={TransformScope} value={{...initial, id}}>
      {children}
    </ScopeProvider>
  );
};

type HandlePosition = "bottom-left" | "top-left" | "bottom-right" | "top-right";
type ResizableHandleProps = {
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
  return <div {...listeners} {...attributes} className={resizableHandleVariants({ position })}></div>;
}


type TranslateHandleProps = {
  listeners?: DraggableSyntheticListeners
  attributes?: DraggableAttributes
}

export function JotaiTranslateHandle({listeners, attributes}: TranslateHandleProps) {
  return <div className="h-4 w-full bg-blue-300 rounded-md" {...listeners} {...attributes}></div>
}