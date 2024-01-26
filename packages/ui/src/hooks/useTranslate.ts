import { useDndMonitor, useDraggable } from "@dnd-kit/core";
import { molecule } from "bunshi/react";
import { TransformMolecule } from "../Transform";
import { useMolecule } from "bunshi/react";
import { useAtomValue, useSetAtom } from "jotai";
import { CSS } from "@dnd-kit/utilities";
import invariant from "tiny-invariant";

const TranslateMolecule = molecule((mol) => {
  const { optionalTransformAtom, transformIdAtom, transformAtom, onTransformEnd } = mol(TransformMolecule);

  return { optionalTransformAtom, transformIdAtom, transformAtom, onTransformEnd };
});
export function useTranslate() {
  const { transformAtom, optionalTransformAtom, transformIdAtom, onTransformEnd } = useMolecule(TranslateMolecule);
  const transformId = useAtomValue(transformIdAtom);
  const { x, y, width, height } = useAtomValue(transformAtom);
  const setTransform = useSetAtom(optionalTransformAtom);

  const {
    attributes,
    setNodeRef,
    setActivatorNodeRef,
    listeners,
    transform: dragTransform,
  } = useDraggable({ id: `${transformId}-translate`, data: { transform: { type: "translate" } } });

  useDndMonitor({
    onDragStart: ({ active }) => {
      if (!active.data.current || active.data.current.transform.type !== "translate") return;
    },
    onDragEnd: ({ delta, active }) => {
      if (!active.id.toString().startsWith(`${transformId}-translate`)) return;
      setTransform({ x: (x || 0) + delta.x, y: (y || 0) + delta.y });
      invariant(transformId, "no ");
      if (onTransformEnd)
        onTransformEnd({
          x: (x || 0) + delta.x,
          y: (y || 0) + delta.y,
          width,
          height,
          type: "TRANSLATE",
          transformId,
        });
    },
  });

  return {
    dragHandle: { listeners, attributes, setActivatorNodeRef },
    dragRef: setNodeRef,
    translateStyles: { transform: CSS.Transform.toString(dragTransform) },
  };
}
