import { useMolecule } from "bunshi/react";
import { TransformMolecule } from "../Transform";
import { useAtomValue } from "jotai";
import { useResize } from "./useResize";
import { useTranslate } from "./useTranslate";


export type TransformType = 'RESIZE' | 'TRANSLATE'

export function useTransformContext() {
  const { transformAtom, transformIdAtom } =
    useMolecule(TransformMolecule);
  const transformId = useAtomValue(transformIdAtom);
  const { x, y, width, height } = useAtomValue(transformAtom);
  const transformStyles = { left: x, top: y, width, height };

  useResize({
    constraints: {
      width: {
        min: 150,
        max: 800,
      },
      height: {
        min: 150,
        max: 800,
      },
    },
  });

  const { dragHandle, translateStyles, dragRef } = useTranslate();

  
  return { style: { ...translateStyles, ...transformStyles }, dragHandle, transformId, dragRef };
}
