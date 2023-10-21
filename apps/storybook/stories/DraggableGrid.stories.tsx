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
    items: [{id: 1, name: "First"}, {id: 2, name: "First"}, {id: 3, name: "First"}, {id: 4, name: "First"}]
  },
  render: (args) => {
    return (
      <div className="w-[400px] h-[400px]">
        <SortableGrid {...args}>
        </SortableGrid>
      </div>
    );
  },
};
