import { UniqueIdentifier, useDndMonitor } from "@dnd-kit/core";
import { useMolecule } from "bunshi/react";
import { TransformMolecule } from "../JotaiTransform";
import { useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";

type UseTransformArgs = { id: UniqueIdentifier };

export function useTransform() {
  const { transformAtom, transformIdAtom, transformingAtom } = useMolecule(TransformMolecule);
  const transformId = useAtomValue(transformIdAtom);
  const { x, y, width, height } = useAtomValue(transformAtom);
  const transformStyles = { left: x, top: y, width, height };
  const [transforming, setTransforming] = useAtom(transformingAtom);

  useDndMonitor({
    onDragStart: ({ active }) => {
      if (transformId && active.id.toString().startsWith(transformId)) setTransforming(true);
    },
    onDragEnd: () => {
      if (transforming) setTransforming(false);
    },
  });
  return { transforming, transformStyles };
}
