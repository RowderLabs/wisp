// Button.stories.ts
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@wisp/ui';

const meta: Meta<typeof Button> = {
  component: Button,
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Basic: Story = {
  args: {
    children: 'Button'
  }
};
