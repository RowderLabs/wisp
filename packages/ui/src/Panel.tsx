import React from "react";
import Grid, { GridProps } from "./Grid";
import { ImageUploadOverlay, ImageUploader, ImageUploaderProps } from "./ImageUploader";
import { SortableGrid, SortableGridProps } from "./SortableGrid";
import clsx from "clsx";

const panels = {
  gallery: {
    renderContent: ({
      itemCount,
    }: {
      itemCount: NonNullable<SortableGridProps<unknown>["cols"]>;
    }) => {
      const items = Array.from({ length: itemCount }, (_, i) => ({ id: i + 1 }));
      return (
        <SortableGrid
          initialItems={items}
          cols={itemCount}
          defaultColumns={{ colSpan: 4 }}
          gridChild={(item) => (
            <ImageUploader>
              {({ wrapperStyle, ...props }) => (
                <div style={wrapperStyle}>
                  <ImageUploadOverlay {...props} />
                </div>
              )}
            </ImageUploader>
          )}
        />
      );
    },
  },
  image: {
    renderContent: (args: ImageUploaderProps) => (
      <ImageUploader {...args}>
        {({ wrapperStyle, ...props }) => (
          <div style={wrapperStyle}>
            <ImageUploadOverlay imageOpts={props.opts?.image} {...props} />
          </div>
        )}
      </ImageUploader>
    ),
  },
};

export type PanelProps = {
  id: number;
  content: JSX.Element;
  size?: "sm" | "md" | "lg";
};

type PanelKey = keyof typeof panels;
type PanelDefinition<TData> = {
  [key in PanelKey]: {
    renderContent: (args: Parameters<(typeof panels)[key]["renderContent"]>[0]) => JSX.Element; // You can specify a more specific type if needed
  };
};

export const createPanel = <TData, TKey extends PanelKey>(
  pType: TKey,
  opts: Parameters<PanelDefinition<TData>[TKey]["renderContent"]>[0] & Pick<PanelProps, "size">
) => {
  const content = panels[pType].renderContent as PanelDefinition<TData>[TKey]["renderContent"];
  return { size: opts.size, content: content({ ...opts }) };
};

export function Panel({ content, id }: PanelProps) {
  return <>{content}</>;
}
