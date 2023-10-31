// Button.stories.ts
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {Panel, createPanel} from "@wisp/ui";

const meta: Meta<typeof Panel> = {
  component: Panel,
};
export default meta;

type Story = StoryObj<typeof Panel>;

export const Default: Story = {
    render: (_) => {
        const panel = createPanel('image', {size: 'sm'})
      return (
          <Panel id={1} content={panel.content}/>
      );
    },
  };