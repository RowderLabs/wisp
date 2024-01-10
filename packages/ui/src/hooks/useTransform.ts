import { UniqueIdentifier, useDndMonitor } from "@dnd-kit/core";
import { useMolecule } from "bunshi/react";
import { TransformMolecule } from "../JotaiTransform";
import { useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";
import invariant from "tiny-invariant";

type UseTransformArgs = { id: UniqueIdentifier };

export function useTransform() {
  const { transformAtom, transformIdAtom, transformingAtom, onTransformEnd, onTransformStart } =
    useMolecule(TransformMolecule);
  const transformId = useAtomValue(transformIdAtom);
  const { x, y, width, height } = useAtomValue(transformAtom);
  const transformStyles = { left: x, top: y, width, height };
  const [transforming, setTransforming] = useAtom(transformingAtom);

  useDndMonitor({
    onDragStart: ({ active }) => {
      invariant(transformId, "No transform Id");
      if (active.id.toString().startsWith(transformId)) {
        setTransforming(true);
        if (onTransformStart) onTransformStart({ x, y, width, height, transformId });
      }
    },
    onDragEnd: ({ active }) => {
      invariant(transformId, "No transform Id");
      if (onTransformEnd) onTransformEnd({ x, y, width, height, transformId });
      setTransforming(false);
    },
  });
  return { transforming, transformStyles, transformId };
}
