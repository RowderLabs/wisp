import { atom, Provider, useAtom, useSetAtom, useAtomValue } from "jotai";
import { useHydrateAtoms, useReducerAtom } from "jotai/utils";
import { PropsWithChildren, useEffect, useMemo } from "react";
import { Maybe } from "./Transform";
import { ComponentScope, createScope, molecule, ScopeProvider, useMolecule } from "bunshi/react";
import { DragMoveEvent } from "@dnd-kit/core";

type Transform = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type TransformContraints = {
  min: number;
  max: number;
};

const checkConstraints = ({
  val,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
}: { val: number } & Partial<TransformContraints>) => {
  return val > min && val < max;
};

export const TransformScope = createScope<Maybe<Transform>>({
  x: undefined,
  y: undefined,
  width: undefined,
  height: undefined,
});

//transform context creator
const TransformMolecule = molecule((mol, scope) => {
  const initial = scope(TransformScope);
  const transformAtom = atom(initial);
  const readOnlyTransform = atom((get) => get(transformAtom));

  const transformSetter = atom(null, (_get, set, { x, y, width, height }: Partial<Transform>) => {
    set(transformAtom, {
      ..._get(readOnlyTransform),
      ...(height && { height }),
      ...(width && { width }),
      ...(x && { x }),
      ...(y && { y }),
    });
  });
  return { transformSetter, readOnlyTransform };
});

//module for handling translation within transform context
const TranslateMolecule = molecule((mol) => {
  const { transformSetter, readOnlyTransform } = mol(TransformMolecule);
  const translateAtom = atom(
    (get) => {
      const { x, y } = get(readOnlyTransform);
      return { x, y };
    },
    (_get, set, { x, y }: Partial<{ x: number; y: number }>) => {
      set(transformSetter, { x, y });
    }
  );

  return { translateAtom };
});

//module for handling resize within transform context
const ResizeMolecule = molecule((mol) => {
  const { readOnlyTransform, transformSetter } = mol(TransformMolecule);
  const clampedTransformScaleAtom = atom(
    null,
    (_get, set, { width, height }: Partial<{ width: number; height: number }>) => {
      if (width && checkConstraints({ val: width, min: 0, max: 500 }))
        set(transformSetter, { width });
      if (height && checkConstraints({ val: height, min: 0, max: 500 }))
        set(transformSetter, { height });
    }
  );
  const dragStartDimensionsAtom = atom<Maybe<{ width: number; height: number }>>({
    width: undefined,
    height: undefined,
  });
  const dragStartPositionAtom = atom<Maybe<{ x: number; y: number }>>({
    x: undefined,
    y: undefined,
  });

  return {
    readOnlyTransform,
    clampedTransformScaleAtom,
    dragStartPositionAtom,
    dragStartDimensionsAtom,
  };
});

type TransformProps = {
  initial?: Partial<Transform>;
};
export const JotaiTransform = ({
  children,
  initial = { width: undefined, height: undefined, x: undefined, y: undefined },
}: PropsWithChildren<TransformProps>) => {
  return (
    <ScopeProvider scope={TransformScope} value={initial}>
      {children}
    </ScopeProvider>
  );
};


export const useBunshiTranslate = () => {
  const {translateAtom} = useMolecule(TranslateMolecule)
  return useAtom(translateAtom)
}

export const useBunshiResizable = () => {
  const {
    clampedTransformScaleAtom,
    dragStartPositionAtom,
    dragStartDimensionsAtom,
    readOnlyTransform,
  } = useMolecule(ResizeMolecule);

  const transform = useAtomValue(readOnlyTransform);
  const setDimensions = useSetAtom(clampedTransformScaleAtom);
  const [dragStartPos, setDragStartPos] = useAtom(dragStartPositionAtom);
  const [dragStartDim, setDragStartDim] = useAtom(dragStartDimensionsAtom);

  const resizeTopLeft = ({ delta }: Pick<DragMoveEvent, "delta">) => {
    const projectedWidth = dragStartDim.width! - delta.x;
    const projectedHeight = dragStartDim.height! - delta.y;
    setDimensions({ width: 50 });
    setDimensions({ height: 100 });
  };

  return { resizeTopLeft, transform };
};
