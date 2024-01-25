import { UniqueIdentifier, useDndMonitor } from "@dnd-kit/core";
import { useMolecule } from "bunshi/react";
import { TransformMolecule } from "../Transform";
import { useAtom, useAtomValue } from "jotai";
import invariant from "tiny-invariant";
import { useResize } from "./useResize";
import { useTranslate } from "./useTranslate";

type UseTransformArgs = { id: UniqueIdentifier };

export function useTransform() {
  const { transformAtom, transformIdAtom, transformingAtom, onTransformEnd, onTransformStart } =
    useMolecule(TransformMolecule);
  const transformId = useAtomValue(transformIdAtom);
  const { x, y, width, height } = useAtomValue(transformAtom);
  const transformStyles = { left: x, top: y, width, height };
  const [transforming, setTransforming] = useAtom(transformingAtom);

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

  const { translateHandle, translateStyles, translateRef } = useTranslate();

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
  return { style: { ...translateStyles, ...transformStyles }, translateHandle, transformId, translateRef };
}
