import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { molecule, useMolecule } from "bunshi/react";
import { TransformMolecule, Transform } from "../JotaiTransform";
import { DragMoveEvent, useDndMonitor } from "@dnd-kit/core";
import { HandlePosition, Maybe } from "../Transform";

type TransformContraints = {
  min: number;
  max: number;
};

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

const checkConstraints = ({
  val,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
}: { val: number } & Partial<TransformContraints>) => {
  return val > min && val < max;
};

const ResizeMolecule = molecule((mol) => {
  const { transformAtom, optionalTransformAtom } = mol(TransformMolecule);

  //clamps width and height
  const resizeWithConstraintsAtom = atom(
    null,
    (_get, set, { x, y, width, height }: WithRequired<Partial<Transform>, "width" | "height">) => {
      if (checkConstraints({ val: width, min: 150, max: 600 })) set(optionalTransformAtom, { x, width });
      if (checkConstraints({ val: height, min: 150, max: 600 })) set(optionalTransformAtom, { y, height });
    }
  );
  //starting transform when drag begins
  const dragStartTransformAtom = atom<Partial<Transform>>({});
  const lastHandlePositionAtom = atom<Maybe<HandlePosition>>(undefined);

  return {
    transformAtom,
    resizeWithConstraintsAtom,
    lastHandlePositionAtom,
    dragStartTransformAtom,
  };
});

export const useResize = () => {
  const { transformAtom, resizeWithConstraintsAtom, dragStartTransformAtom, lastHandlePositionAtom } =
    useMolecule(ResizeMolecule);

  const transform = useAtomValue(transformAtom);
  const resizeWithConstraints = useSetAtom(resizeWithConstraintsAtom);
  const [dragStartTransform, setDragStartTransform] = useAtom(dragStartTransformAtom);
  const [lastHandlePosition, setLastHandlePosition] = useAtom(lastHandlePositionAtom);

  useDndMonitor({
    onDragStart: ({ active }) => {
      if (!active.data.current || active.data.current.transform.type !== "resize") return;
      setLastHandlePosition(active.data.current.transform.handlePosition);
      setDragStartTransform(transform);
    },
    onDragMove: ({ delta }) => {
      if (lastHandlePosition === "top-right") resizeTopRight({ delta });
      if (lastHandlePosition === "top-left") resizeTopLeft({ delta });
      if (lastHandlePosition === "bottom-right") resizeBottomRight({ delta });
      if (lastHandlePosition === "bottom-left") resizeBottomLeft({ delta });
    },
  });

  const resizeTopLeft = ({ delta }: Pick<DragMoveEvent, "delta">) => {
    resizeWithConstraints({
      width: dragStartTransform.width! - delta.x,
      height: dragStartTransform.height! - delta.y,
      x: dragStartTransform.x! + delta.x,
      y: dragStartTransform.y! + delta.y,
    });
  };

  const resizeBottomLeft = ({ delta }: Pick<DragMoveEvent, "delta">) => {
    resizeWithConstraints({
      width: dragStartTransform.width! - delta.x,
      height: dragStartTransform.height! + delta.y,
      x: dragStartTransform.x! + delta.x,
    });
  };

  const resizeBottomRight = ({ delta }: Pick<DragMoveEvent, "delta">) => {
    resizeWithConstraints({
      width: dragStartTransform.width! + delta.x,
      height: dragStartTransform.height! + delta.y,
    });
  };

  const resizeTopRight = ({ delta }: Pick<DragMoveEvent, "delta">) => {
    resizeWithConstraints({
      width: dragStartTransform.width! + delta.x,
      height: dragStartTransform.height! - delta.y,
      y: dragStartTransform.y! + delta.y,
    });
  };

  return { transform, lastHandlePosition };
};
