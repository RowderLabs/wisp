// Button.stories.ts
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DraggableGrid, DraggableGridChild } from "@wisp/ui";

const meta: Meta<typeof DraggableGrid> = {
  component: DraggableGrid,
};
export default meta;

type Story = StoryObj<typeof DraggableGrid>;

export const Default: Story = {
  render: (args) => {
    return (
      <div className="w-[400px] h-[400px]">
        <DraggableGrid {...args}>
          <DraggableGridChild disabled={false} />
          <DraggableGridChild disabled={false} />
          <DraggableGridChild disabled={false} />
          <DraggableGridChild disabled={false} />
        </DraggableGrid>
      </div>
    );
  },
};
