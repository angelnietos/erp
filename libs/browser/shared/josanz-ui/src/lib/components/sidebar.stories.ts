import type { Meta, StoryObj } from '@storybook/angular';
import { SidebarComponent } from './sidebar';
import { expect } from 'storybook/test';

const meta: Meta<SidebarComponent> = {
  component: SidebarComponent,
  title: 'SidebarComponent',
};
export default meta;

type Story = StoryObj<SidebarComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/sidebar/gi)).toBeTruthy();
  },
};
