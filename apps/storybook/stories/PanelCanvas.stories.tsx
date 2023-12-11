// Button.stories.ts
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { PanelCanvas} from "@wisp/ui";

const meta: Meta<typeof PanelCanvas> = {
  component: PanelCanvas,
};
export default meta;

type Story = StoryObj<typeof PanelCanvas>;

export const Default: Story = {
  render: (_) => {
    return (
      <div className="w-[1200px] h-[400px]">
        <PanelCanvas/>
      </div>
    );
  },
};
