import { DraggableSyntheticListeners } from "@dnd-kit/core";
import { CSS, Transform } from "@dnd-kit/utilities";
import React from "react";
import type { PropsWithChildren } from "react";

type DndItemProps = {
  transition?: string | null;
  transform?: Transform | null;
  listeners?: DraggableSyntheticListeners;
  className?: string;
  renderItem?(args: {
    dragOverlay: boolean;
    dragging: boolean;
    sorting: boolean;
    index: number | undefined;
    fadeIn: boolean;
    listeners: DraggableSyntheticListeners;
    ref: React.Ref<HTMLElement>;
    transform: DndItemProps["transform"];
    transition: DndItemProps["transition"];
  }): React.ReactElement;
};

export const DndItem = React.memo(
  React.forwardRef<HTMLDivElement, PropsWithChildren<DndItemProps>>(
    ({ listeners, transition, transform, className, children }, ref) => {
      const style = {
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        transition: transition ? transition : undefined,
      };
      return (
        <div
          {...listeners}
          style={style}
          className={className}
          ref={ref}
        >{children}</div>
      );
    }
  )
);
