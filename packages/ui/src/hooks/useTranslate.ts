import { DragMoveEvent, useDndMonitor, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { molecule, useMolecule } from "bunshi/react";
import { TransformScope } from "../Transform";
import invariant from "tiny-invariant";
import { useEffect, useState } from "react";

const TranslateMolecule = molecule((_, scope) => {
  const transformCtx = scope(TransformScope);
  invariant(transformCtx, "Failed to get transform context in useTranslate");

  const { id: transformId, transform } = transformCtx;
  const translate = ({ delta }: Pick<DragMoveEvent, "delta">) => {
    if (!transformCtx.onTransform) return;
    transformCtx.onTransform({
      id: transformId,
      ...transform,
      x: transform.x + delta.x,
      y: transform.y + delta.y,
      type: "TRANSLATE",
    });
  };

  return { translate, transformId };
});

export function useTranslate({ canMove }: { canMove: boolean }) {
  const { transformId, translate } = useMolecule(TranslateMolecule);
  const [disabled, setDisabled] = useState(false);
  const {
    attributes,
    setNodeRef,
    setActivatorNodeRef,
    listeners,
    isDragging,
    transform: dragTransform,
  } = useDraggable({ id: `${transformId}-translate`, data: { transform: { type: "translate" } }, disabled });

  useEffect(() => {
    setDisabled(!canMove);
  }, [canMove]);

  useDndMonitor({
    onDragStart: ({ active }) => {
      if (!active.data.current || active.data.current.transform.type !== "translate") return;
    },
    onDragEnd: ({ delta, active }) => {
      if (!active.id.toString().startsWith(`${transformId}-translate`)) return;
      translate({ delta });
    },
  });

  return {
    dragHandle: { listeners, attributes, setActivatorNodeRef },
    dragRef: setNodeRef,
    isDragging,
    translateStyles: { transform: isDragging ? CSS.Transform.toString(dragTransform) : undefined },
  };
}
