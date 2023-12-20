// Button.stories.ts
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TreeView } from "@wisp/ui";
import { useTreeView } from "@wisp/ui/src/hooks";

const meta: Meta<typeof TreeView> = {
  component: TreeView,
};
export default meta;
type Story = StoryObj<typeof TreeView>;

export const Default: Story = {
  args: {
    indentation: 20,
    treeData: {
      root: {
        id: "root",
        name: "root",
        children: ["item-1", "item-2"],
        isCollection: true,
      },
      "item-1": {
        id: "item-1",
        children: ["item-3"],
        name: "Item 1",
        isCollection: true,
      },
      "item-2": {
        id: "item-2",
        children: [],
        name: "Item 2",
        isCollection: false,
      },
      "item-3": {
        id: "item-3",
        children: ["item-4"],
        name: "Item 3",
        isCollection: true,
      },
      "item-4": {
        id: "item-4",
        children: [],
        name: "Item 4",
        isCollection: false,
      },
    },
  },
  render: (args) => {
    const [_, treeApi] = useTreeView();

    return (
      <div className="w-[300px] h-[600px]">
        <TreeView
          renderItem={({ name, isCollection }) => {
            return isCollection ? <span>(folder) {name}</span> : <span>{name}</span>;
          }}
          onExpansionChange={treeApi.toggleExpand}
          treeData={args.treeData}
          indentation={args.indentation}
          {...treeApi}
        />
      </div>
    );
  },
};
