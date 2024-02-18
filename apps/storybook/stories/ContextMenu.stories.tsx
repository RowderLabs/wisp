// Button.stories.ts
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { HiOutlineTrash, HiOutlinePencilSquare, HiOutlineFolder } from "react-icons/hi2";
import { ContextMenu } from "@wisp/ui";

const meta: Meta<(typeof ContextMenu)["Root"]> = {
  component: ContextMenu["Root"],
};
export default meta;

type Story = StoryObj<(typeof ContextMenu)["Root"]>;

export const Basic: Story = {
  args: {
    trigger: (
      <div className="w-[400px] h-[400px] border border-blue-500 flex justify-center items-center">
        <p>Right click to trigger</p>
      </div>
    ),
  },
  render: (args) => (
    <ContextMenu.Root {...args}>
      <ContextMenu.Item icon={<HiOutlinePencilSquare />}>Rename</ContextMenu.Item>
      <ContextMenu.Item icon={<HiOutlineTrash />}>Delete</ContextMenu.Item>
      <ContextMenu.Separator />
      <ContextMenu.Item icon={<HiOutlineFolder />}>Show in Finder</ContextMenu.Item>
    </ContextMenu.Root>
  ),
};
