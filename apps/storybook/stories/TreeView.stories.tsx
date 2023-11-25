// Button.stories.ts
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TreeView} from "@wisp/ui";

const meta: Meta<typeof TreeView> = {
  component: TreeView,
};
export default meta;
type Story = StoryObj<typeof TreeView>;


export const Default: Story = {
    args: {
        items: {
            root: {
                id: 'root',
                name: 'root',
                children: ['item-1', 'item-2']
            },
            'item-1': {
                id: 'item-1',
                children: ['item-3'],
                name: 'Item 1'
            },
            'item-2': {
                id: 'item-2',
                children: [],
                name: 'Item 2'
            },
            'item-3': {
                id: 'item-3',
                children: [],
                name: 'Item 3'
            }
        }
    },
    render: (args) => {
        return <div className="w-[300px] h-[600px]">
            <TreeView {...args}/>
        </div>
    }
}