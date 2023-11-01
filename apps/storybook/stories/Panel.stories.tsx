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
    const panel = createPanel("grid", {
      gridChild: (item) => (
        <div className="p-2 bg-slate-400 text-white flex justify-center items-center">
          <span>block {item.id}</span>
        </div>
      ),
      gap: 4,
      cols: 12,
      initialItems: [{ id: 1 }, { id: 2 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }],
      defaultColumns: { colSpan: 4 },
    });
    return <Panel id={1} content={panel.content} />;
  },
};
