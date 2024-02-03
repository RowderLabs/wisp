import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@wisp/ui';

const meta: Meta<typeof Input> = {
  component: Input,
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Basic: Story = {
    args: {
        placeholder: 'Email'
    }
};
