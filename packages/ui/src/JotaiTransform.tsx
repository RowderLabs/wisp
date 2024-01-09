import { atom, Provider, useAtom, WritableAtom, ExtractAtomValue } from "jotai";
import { useHydrateAtoms, useReducerAtom } from "jotai/utils";
import { PropsWithChildren, useEffect, useMemo } from "react";
import { Maybe } from "./Transform";
import { number } from "zod";
import { ComponentScope, createScope, molecule, ScopeProvider, useMolecule } from "bunshi/react";

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


export const TransformScope = createScope<Maybe<Transform>>({ x: undefined, y: undefined, width: 50, height: 50 });

const TransformMolecule = molecule((_, scope) => {
  scope(TransformScope)
  const transformAtom = atom<Maybe<Transform>>({ x: 0, y: 0, width: 0, height: 0 });
  const sizeConstraintAtom = atom<Maybe<TransformContraints>>({ min: 0, max: 300 });
  const transformWidthAtom = atom(
    (get) => get(transformAtom).width,
    (_get, set, width: number) => {
      const { min, max } = _get(sizeConstraintAtom);
      if (checkConstraints({val: width, min, max})) set(transformAtom, { ..._get(transformAtom), width });
    }
  );

  const transformHeightAtom = atom(
    (get) => get(transformAtom).width,
    (_get, set, height: number) => {
      const { min, max } = _get(sizeConstraintAtom);
      if (checkConstraints({ val: height, min, max })) set(transformAtom, { ..._get(transformAtom), height });
    }
  );
  return { transformAtom, transformWidthAtom, transformHeightAtom };
});

type TransformProps = {
  initial?: Partial<Transform>;
};
export const JotaiTransform = ({
  children,
  initial = { width: undefined, height: undefined, x: undefined, y: undefined },
}: PropsWithChildren<TransformProps>) => {
  return <Child />;
};

const Child = () => {
  const { transformWidthAtom, transformAtom } = useMolecule(TransformMolecule);
  const [t, _] = useAtom(transformAtom)
  return (
    <div>
      {JSON.stringify(t)}
      <DeepChild />
    </div>
  );
};

const DeepChild = () => {
  const { transformWidthAtom, transformAtom } = useMolecule(TransformMolecule);
  const [width, setWidth] = useAtom(transformWidthAtom);

  return (
    <div>
      <p>{width}</p>
      <button onClick={() => setWidth((width || 0) + 50)}>Set x</button>
    </div>
  );
};
