import type { Meta, StoryObj } from '@storybook/angular';
import { UserAvatarComponent } from './user-avatar';
import { expect, within } from '@storybook/test';

const meta: Meta<UserAvatarComponent> = {
  component: UserAvatarComponent,
  title: 'UserAvatarComponent',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<UserAvatarComponent>;

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};
