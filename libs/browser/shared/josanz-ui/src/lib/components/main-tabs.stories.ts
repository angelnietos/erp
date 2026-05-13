import type { Meta, StoryObj } from '@storybook/angular';
import { MainTabsComponent } from './main-tabs';
import { expect } from 'storybook/test';

const meta: Meta<MainTabsComponent> = {
  component: MainTabsComponent,
  title: 'MainTabsComponent',
};
export default meta;

type Story = StoryObj<MainTabsComponent>;

export const Primary: Story = {
  args: {
    options: [],
    selection: '',
  },
};

export const Heading: Story = {
  args: {
    options: [],
    selection: '',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/main-tabs/gi)).toBeTruthy();
  },
};
