import type { Meta, StoryObj } from '@storybook/angular';
import { FilterTabsComponent } from './filter-tabs';
import { expect, within } from '@storybook/test';

const meta: Meta<FilterTabsComponent> = {
  component: FilterTabsComponent,
  title: 'FilterTabsComponent',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<FilterTabsComponent>;

export const Primary: Story = {
  args: {
    options: ['Todas', 'Tipo X', 'Tipo Y', 'Tipo Z'],
    selected: 'Todas',
  },
};

export const Heading: Story = {
  args: {
    options: ['Todas', 'Tipo X', 'Tipo Y', 'Tipo Z'],
    selected: 'Todas',
  },
  
};
