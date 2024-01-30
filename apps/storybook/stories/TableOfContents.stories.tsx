// Button.stories.ts
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TableOfContents } from "@wisp/ui";

const meta: Meta<typeof TableOfContents> = {
  component: TableOfContents,
};
export default meta;

type Story = StoryObj<typeof TableOfContents>;

export const Default: Story = {
  args: {},
  render: (_args) => {
    return (
      <div className="max-w-[300px] min-h-[600px] border">
        <TableOfContents />
      </div>
    );
  },
};
