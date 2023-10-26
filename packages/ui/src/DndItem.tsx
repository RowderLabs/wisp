import { DraggableSyntheticListeners, DraggableAttributes, UniqueIdentifier } from "@dnd-kit/core";
import { CSS, Transform } from "@dnd-kit/utilities";
import React from "react";
import {motion} from 'framer-motion'
import type { PropsWithChildren } from "react";

type DndItemProps = {
  id: UniqueIdentifier,
  isDragging: boolean;
  transition?: string | null;
  attributes?: DraggableAttributes;
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
    ({ listeners, transition, transform, className, children, id, isDragging, attributes }, ref) => {
      const style = {
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        transition: transition ? transition : undefined,
      };
      return (
        <motion.div
          className={className}
          ref={ref}
          layoutId={String(id)}
          animate={
            transform
              ? {
                  x: transform.x,
                  y: transform.y,
                  scale: isDragging ? 1.05 : 1,
                  zIndex: isDragging ? 1 : 0,
                  boxShadow: isDragging
                    ? "0 0 0 1px rgba(63, 63, 68, 0.05), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)"
                    : undefined,
                }
              : ''
          }
          transition={{
            duration: !isDragging ? 0.25 : 0,
            easings: {
              type: "spring",
            },
            scale: {
              duration: 0.25,
            },
            zIndex: {
              delay: isDragging ? 0 : 0.25,
            },
          }}
          {...attributes}
          {...listeners}
        >
          {children}
        </motion.div>
      );
    }
  )
);
