import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { createScope, molecule, useMolecule } from "bunshi/react";
import { TransformMolecule, Transform } from "../JotaiTransform";
import { DragMoveEvent, useDndMonitor } from "@dnd-kit/core";
import { HandlePosition, Maybe } from "../Transform";
import { useMemo } from "react";
import invariant from "tiny-invariant";

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
type MinMaxConstraint = Partial<{ min: number; max: number }>;
type ResizeContraints = {
  width: Partial<MinMaxConstraint>;
  height: Partial<MinMaxConstraint>;
};

const checkResizeResizeConstraints = ({ val, min = 0, max = 9999 }: { val: number } & Partial<MinMaxConstraint>) => {
  return val > min && val < max;
};

const ResizeMolecule = molecule((mol) => {
  const { transformAtom, optionalTransformAtom, transformIdAtom } = mol(TransformMolecule);

  //clamps width and height
  const resizeWithConstraintsAtom = atom(
    null,
    (
      _get,
      set,
      {
        x,
        y,
        width,
        height,
        constraints,
      }: WithRequired<Partial<Transform>, "width" | "height"> & { constraints?: UseResizeArgs["constraints"] }
    ): void => {
      constraints;
      if (checkResizeResizeConstraints({ val: width, min: constraints?.width?.min, max: constraints?.width?.max }))
        set(optionalTransformAtom, { x, width });
      if (checkResizeResizeConstraints({ val: height, min: constraints?.height?.min, max: constraints?.height?.max }))
        set(optionalTransformAtom, { y, height });
    }
  );
  //starting transform when drag begins
  const dragStartTransformAtom = atom<Partial<Transform>>({});
  const lastHandlePositionAtom = atom<Maybe<HandlePosition>>(undefined);

  return {
    transformAtom,
    transformIdAtom,
    resizeWithConstraintsAtom,
    lastHandlePositionAtom,
    dragStartTransformAtom,
  };
});

type UseResizeArgs = {
  constraints?: Partial<{
    width: Partial<{
      min: number;
      max: number;
    }>;
    height: Partial<{
      min: number;
      max: number;
    }>;
  }>;
};

export const useResize = ({ constraints }: UseResizeArgs) => {
  const { transformAtom, transformIdAtom, resizeWithConstraintsAtom, dragStartTransformAtom, lastHandlePositionAtom } =
    useMolecule(ResizeMolecule);
  const transform = useAtomValue(transformAtom);

  invariant(
    !(JSON.stringify(transform) === '{}'),
    "No transform found. Make sure you are wrapping useResize component with <Transform/>"
  );
  const transformId = useAtomValue(transformIdAtom);
  const resizeWithConstraints = useSetAtom(resizeWithConstraintsAtom);
  const [dragStartTransform, setDragStartTransform] = useAtom(dragStartTransformAtom);
  const [lastHandlePosition, setLastHandlePosition] = useAtom(lastHandlePositionAtom);

  useDndMonitor({
    onDragStart: ({ active }) => {
      if (!active.data.current || active.data.current.transform.type !== "resize") return;
      setLastHandlePosition(active.data.current!.transform.handlePosition);
      setDragStartTransform(transform);
    },
    onDragMove: ({ delta, active }) => {
      if (!active.id.toString().startsWith(`${transformId}-resize`)) return;
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
      constraints,
    });
  };

  const resizeBottomLeft = ({ delta }: Pick<DragMoveEvent, "delta">) => {
    resizeWithConstraints({
      width: dragStartTransform.width! - delta.x,
      height: dragStartTransform.height! + delta.y,
      x: dragStartTransform.x! + delta.x,
      constraints,
    });
  };

  const resizeBottomRight = ({ delta }: Pick<DragMoveEvent, "delta">) => {
    resizeWithConstraints({
      width: dragStartTransform.width! + delta.x,
      height: dragStartTransform.height! + delta.y,
      constraints,
    });
  };

  const resizeTopRight = ({ delta }: Pick<DragMoveEvent, "delta">) => {
    resizeWithConstraints({
      width: dragStartTransform.width! + delta.x,
      height: dragStartTransform.height! - delta.y,
      y: dragStartTransform.y! + delta.y,
      constraints,
    });
  };

};
