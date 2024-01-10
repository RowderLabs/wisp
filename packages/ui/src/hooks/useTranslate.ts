import { useDndMonitor, useDraggable } from "@dnd-kit/core";
import { molecule } from "bunshi/react";
import { TransformMolecule } from "../JotaiTransform";
import { useMolecule } from "bunshi/react";
import { useAtomValue, useSetAtom } from "jotai";
import { CSS } from "@dnd-kit/utilities";

const TranslateMolecule = molecule((mol) => {
  const { optionalTransformAtom, transformIdAtom, transformAtom } = mol(TransformMolecule);

  return { optionalTransformAtom, transformIdAtom, transformAtom };
});
export function useTranslate() {
  const { transformAtom, optionalTransformAtom, transformIdAtom } = useMolecule(TranslateMolecule);
  const transformId = useAtomValue(transformIdAtom);
  const { x, y } = useAtomValue(transformAtom);
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
    },
  });

  return {
    handle: { listeners, attributes, setActivatorNodeRef },
    translateRef: setNodeRef,
    dragStyles: {transform: CSS.Transform.toString(dragTransform)},
  };
}
