// Button.stories.ts
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FileTree, SimpleNode } from "@wisp/ui";

const meta: Meta<typeof FileTree> = {
  component: FileTree,
};
export default meta;
const treeNodes: { [key: string]: SimpleNode[] } = {
  "/familytrees": [{ id: 10, path: "/familytrees", name: "Family Trees", expanded: true, isCollection: true }],
  "/familytrees/10": [
    { id: 11, path: "/familytrees/10", name: "Blackwoods", expanded: false, isCollection: false },
    { id: 12, path: "/familytrees/10", name: "Williamsons", expanded: false, isCollection: false },
  ],
};

type Story<T extends SimpleNode = SimpleNode> = StoryObj<typeof FileTree<T>>;

export const Default: Story = {
  args: {
    nodes: treeNodes,
    rootPath: "/familytrees",
    toggleExpanded: (id) => console.log(id),
    renderItem: ({ name, isCollection }) =>
      isCollection ? (
        <div className="flex gap-1 items-center">
          <span className="basis-full">{name}</span>
        </div>
      ) : (
        <li className="p-1 ml-2 pl-2 flex gap-1 items-center text-sm font-semibold text-slate-600 cursor-pointer rounded-lg">
          <div className="flex gap-1 items-center">
            <span className="basis-full">Item {name}</span>
          </div>
        </li>
      ),
  },
  render: (args) => {
    return (
      <div className="w-[800px] h-[600px]">
        <FileTree {...args} />
      </div>
    );
  },
};
