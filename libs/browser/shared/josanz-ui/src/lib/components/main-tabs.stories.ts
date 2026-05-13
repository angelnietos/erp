import type { Meta, StoryObj } from '@storybook/angular';
import { MainTabsComponent } from './main-tabs';
import { expect, within } from '@storybook/test';

const meta: Meta<MainTabsComponent> = {
  component: MainTabsComponent,
  title: 'MainTabsComponent',
  tags: ['autodocs'],
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
  
};
