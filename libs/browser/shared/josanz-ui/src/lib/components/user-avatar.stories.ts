import type { Meta, StoryObj } from '@storybook/angular';
import { UserAvatarComponent } from './user-avatar';
import { expect } from 'storybook/test';

const meta: Meta<UserAvatarComponent> = {
  component: UserAvatarComponent,
  title: 'UserAvatarComponent',
};
export default meta;

type Story = StoryObj<UserAvatarComponent>;

export const Primary: Story = {
  args: {
    size: 'sm',
  },
};

export const Heading: Story = {
  args: {
    size: 'sm',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/user-avatar/gi)).toBeTruthy();
  },
};
