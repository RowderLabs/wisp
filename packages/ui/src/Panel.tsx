import React from "react";
import Grid, { GridProps } from "./Grid";
import UploadableImage, { UploadableImageProps } from "./UploadableImage";

const panels = {
  grid: {
    renderContent: (args: GridProps) => <Grid {...args} />,
  },
  image: {
    renderContent: (args: UploadableImageProps) => <UploadableImage {...args} />,
  },
};

type PanelProps = {
  id: number;
  content: JSX.Element;
  size?: "sm" | "md" | "lg";
};

type PanelRenderProps<T extends keyof PanelDef> = Parameters<PanelDef[T]["renderContent"]>[0];

type PanelDef = typeof panels;

export const createPanel = <T extends keyof PanelDef>(
  pType: T,
  opts: (PanelRenderProps<T> | undefined) & Omit<PanelProps, "id" | "content">
): Omit<PanelProps, "id"> => {
  return { size: opts.size, content: panels[pType].renderContent({ ...opts }) };
};

export function Panel({ content, id }: PanelProps) {
  return <div>{content}</div>;
}
