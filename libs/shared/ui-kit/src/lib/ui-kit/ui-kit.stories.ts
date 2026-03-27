import type { Meta, StoryObj } from '@storybook/angular';
import { UiKit } from './ui-kit';
import { expect } from 'storybook/test';

const meta: Meta<UiKit> = {
  component: UiKit,
  title: 'UiKit',
};
export default meta;

type Story = StoryObj<UiKit>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/ui-kit/gi)).toBeTruthy();
  },
};
