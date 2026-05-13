import type { Meta, StoryObj } from '@storybook/angular';
import { UserAvatarComponent } from './user-avatar';
import { expect, within } from '@storybook/test';

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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/user-avatar/gi)).toBeTruthy();
  },
};
