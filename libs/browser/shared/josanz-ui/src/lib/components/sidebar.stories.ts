import type { Meta, StoryObj } from '@storybook/angular';
import { SidebarComponent } from './sidebar';
import { expect, within } from '@storybook/test';

const meta: Meta<SidebarComponent> = {
  component: SidebarComponent,
  title: 'SidebarComponent',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<SidebarComponent>;

export const Primary: Story = {
  args: {},
};

