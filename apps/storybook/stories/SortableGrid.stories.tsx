// Button.stories.ts
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SortableGrid } from "@wisp/ui";

const meta: Meta<typeof SortableGrid> = {
  component: SortableGrid,
};
export default meta;

type Story = StoryObj<typeof SortableGrid>;

export const Default: Story = {
  args: {
    initialItems: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }],
    layout: [{colSpan: 3,}, {colSpan: 3,}, {colSpan: 3}, {colSpan: 6}, {colSpan: 4,}, {colSpan: 4,}, {colSpan: 4,}, {colSpan: 12}]
  },
  render: (args) => {
    return (
      <div className="w-[900px] h-[600px]">
        <SortableGrid {...args}></SortableGrid>
      </div>
    );
  },
};


