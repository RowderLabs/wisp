// Button.stories.ts
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Panel, createPanel } from "@wisp/ui";

const meta: Meta<typeof Panel> = {
  component: Panel,
};
export default meta;

type Story = StoryObj<typeof Panel>;

export const Default: Story = {
  render: (_) => {
    const panel = createPanel("gallery", { itemCount: 9 });
    return (
      <div className="w-[600px] h-[600px]">
        <Panel id={1} content={panel.content} />
      </div>
    );
  },
};
