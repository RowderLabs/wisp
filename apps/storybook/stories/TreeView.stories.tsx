// Button.stories.ts
import React, { useEffect, useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TreeView } from "@wisp/ui";
import { TreeViewApiHandle } from "@wisp/ui/src/hooks/useTreeView";

const meta: Meta<typeof TreeView> = {
  component: TreeView,
};
export default meta;
type Story = StoryObj<typeof TreeView>;

export const Default: Story = {
  args: {
    indentation: 20,
    initialData: {
      root: {
        id: "root",
        name: "root",
        children: ["item-1", "item-2"],
      },
      "item-1": {
        id: "item-1",
        children: ["item-3"],
        name: "Item 1",
      },
      "item-2": {
        id: "item-2",
        children: [],
        name: "Item 2",
      },
      "item-3": {
        id: "item-3",
        children: ["item-4"],
        name: "Item 3",
      },
      "item-4": {
        id: "item-4",
        children: [],
        name: "Item 4",
      },
    },
  },
  render: (args) => {
    const treeRef = useRef<TreeViewApiHandle>(null);

    const expandAll = () => {
        treeRef.current?.expandAll()
    }
    const collapseAll = () => {
        treeRef.current?.collapseAll()
    }

    return (
      <div className="w-[300px] h-[600px]">
        <TreeView ref={treeRef} {...args} />
        <div className="mb-2">
          <button className="rounded-md p-1 text-sm  border" onClick={expandAll}>Expand All</button>
          <button className="rounded-md p-1 text-sm  border"  onClick={collapseAll}>Collapse All</button>
        </div>
      </div>
    );
  },
};
