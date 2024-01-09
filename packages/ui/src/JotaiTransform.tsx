import { atom } from "jotai";
import { PropsWithChildren } from "react";
import { Maybe } from "./Transform";
import { createScope, molecule, ScopeProvider } from "bunshi/react";

export type Transform = {
  x: number;
  y: number;
  width: number;
  height: number;
};



export const TransformScope = createScope<Maybe<Transform>>({
  x: undefined,
  y: undefined,
  width: undefined,
  height: undefined,
});

//transform context creator
export const TransformMolecule = molecule((_, scope) => {
  const initial = scope(TransformScope);
  const transformAtom = atom(initial);

  const optionalTransformAtom = atom(null, (_get, set, { x, y, width, height }: Partial<Transform>) => {
    set(transformAtom, {
      ..._get(transformAtom),
      ...(height && { height }),
      ...(width && { width }),
      ...(x && { x }),
      ...(y && { y }),
    });
  });
  return { optionalTransformAtom, transformAtom };
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





