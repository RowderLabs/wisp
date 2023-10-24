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
    gap: 4,
    cols: 12,
    initialItems: [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 },
      { id: 6 },
      { id: 7 },
      { id: 8 },
      { id: 9 },
      { id: 10 },
      { id: 11 },
      { id: 12 },
    ],
  },
  render: (args) => {
    return (
      <div className="w-[800px] h-[600px]">
        <SortableGrid {...args}></SortableGrid>
      </div>
    );
  },
};

export const VariableSizes: Story = {
  args: {
    gap: 4,
    cols: 12,
    initialItems: [{ id: 1 }, { id: 2 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }],
    layout: { 0: { rowSpan: 2, colSpan: 8 }, 6: { colSpan: 8 }, 1: { rowSpan: 2 } },
    defaultColumns: { colSpan: 4, rowSpan: 1 },
  },
  render: (args) => {
    return (
      <div className="w-[600px] h-[600px]">
        <SortableGrid {...args} />
      </div>
    );
  },
};
