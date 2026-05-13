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

export const Default: Story = {
  args: {
    options: ['Todas', 'Activas', 'Pendientes', 'Canceladas'],
    selected: 'Todas',
  },
};

export const CustomOptions: Story = {
  args: {
    options: ['2023', '2024', '2025', '2026'],
    selected: '2024',
  },
};

export const SingleOption: Story = {
  args: {
    options: ['Solo Una'],
    selected: 'Solo Una',
  },
};
