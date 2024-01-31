import { DragMoveEvent, useDndMonitor } from "@dnd-kit/core";
import { useTransformContext } from "./useTransformContext";
import React from "react";
import { Transform, TransformScope } from "../Transform";
import invariant from "tiny-invariant";
import { DndValidation} from "../util/dnd";
import { molecule, useMolecule } from "bunshi/react";

type ResizeEvent = Pick<DragMoveEvent, "delta"> & {
  dragStartTransform: Transform;
  constraints?: ResizeConstraints;
};
type MinMaxConstraint = Partial<{ min: number; max: number }>;
export type ResizeConstraints = {
  width: MinMaxConstraint;
  height: MinMaxConstraint;
};

const ResizeMolecule = molecule((_, scope) => {
  const transformCtx = scope(TransformScope);
  invariant(transformCtx?.id);

  /**
   * 
   * @param transformWithContraints 
   * An updated transform that resize will be attempted on. More details
   * with this RFC https://github.com/microsoft/tsdoc/issues/19
   * @example
   * ```
   * resizeWithConstraints({
      width: 100,
      height: 200,
      x: 0,
      y: 0,
      constraints: {
        width: {max: 150},
        height: {max: 195}
      },
    });
    ```
    This will apply the new width 100 but not the new height 200 because
    it exceeds the height constraint.
   */
  const resizeWithConstraints = ({
    x,
    y,
    width,
    height,
    constraints,
  }: Transform & { constraints?: ResizeConstraints }) => {
    if (!transformCtx?.onTransform) return;
    transformCtx.onTransform({ x, y, width, height, id: transformCtx.id, type: "RESIZE" });
  };
  const resizeTopLeft = ({ dragStartTransform, delta, constraints }: ResizeEvent) => {
    resizeWithConstraints({
      width: dragStartTransform.width! - delta.x,
      height: dragStartTransform.height! - delta.y,
      x: dragStartTransform.x! + delta.x,
      y: dragStartTransform.y! + delta.y,
      constraints,
    });
  };

  const resizeBottomLeft = ({ delta, dragStartTransform, constraints }: ResizeEvent) => {
    resizeWithConstraints({
      width: dragStartTransform.width! - delta.x,
      height: dragStartTransform.height! + delta.y,
      x: dragStartTransform.x! + delta.x,
      y: dragStartTransform.y,
      constraints,
    });
  };

  const resizeBottomRight = ({ delta, dragStartTransform, constraints }: ResizeEvent) => {
    resizeWithConstraints({
      width: dragStartTransform.width! + delta.x,
      height: dragStartTransform.height! + delta.y,
      x: dragStartTransform.x,
      y: dragStartTransform.y,
      constraints,
    });
  };

  const resizeTopRight = ({ delta, dragStartTransform, constraints }: ResizeEvent) => {
    resizeWithConstraints({
      width: dragStartTransform.width! + delta.x,
      height: dragStartTransform.height! - delta.y,
      x: dragStartTransform.x,
      y: dragStartTransform.y! + delta.y,
      constraints,
    });
  };

  return { resizeTopLeft, resizeTopRight, resizeBottomLeft, resizeBottomRight };
});

type UseResizeArgs = {
  constraints?: ResizeConstraints;
};
export function useResize({ constraints }: UseResizeArgs) {
  const { id: transformId, transform } = useTransformContext();
  const { resizeTopLeft, resizeTopRight, resizeBottomLeft, resizeBottomRight } =
    useMolecule(ResizeMolecule);
  const [lastHandlePosition, setLastHandlePosition] = React.useState(undefined);
  const [dragStartTransform, setDragStartTransform] = React.useState<Transform | undefined>(
    undefined
  );

  useDndMonitor({
    onDragStart: ({ active }) => {
      if (!active.data.current || active.data.current.transform.type !== "resize") return;
      setLastHandlePosition(active.data.current!.transform.handlePosition);
      setDragStartTransform(transform);
    },
    onDragMove: ({ delta, active }) => {
      if(!DndValidation.idStartsWith(active.id, `${transformId}-resize`)) return;
      invariant(dragStartTransform, "Could not calculate dragStartTransform in useResize");
      if (lastHandlePosition === "top-right")
        resizeTopRight({ delta, dragStartTransform, constraints });
      if (lastHandlePosition === "top-left")
        resizeTopLeft({ delta, dragStartTransform, constraints });
      if (lastHandlePosition === "bottom-right")
        resizeBottomRight({ delta, dragStartTransform, constraints });
      if (lastHandlePosition === "bottom-left")
        resizeBottomLeft({ delta, dragStartTransform, constraints });
    },
  });
}
