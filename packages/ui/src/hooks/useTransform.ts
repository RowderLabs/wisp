import { UniqueIdentifier } from "@dnd-kit/core";
import { useMolecule } from "bunshi/react";
import { TransformMolecule } from "../JotaiTransform";
import { useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";

type UseTransformArgs = { id: UniqueIdentifier };

export function useTransform() {
  const { transformAtom, transformIdAtom } = useMolecule(TransformMolecule);
  const transformId = useAtomValue(transformIdAtom);
  const {x, y, width, height} = useAtomValue(transformAtom)
  const transformStyles = {left: x, top: y, width, height}
  return { transformStyles };
}
