import type { Meta, StoryObj } from '@storybook/angular';
import { UiStatCardComponent } from './stat-card.component';

const meta: Meta<UiStatCardComponent> = {
  component: UiStatCardComponent,
  title: 'UiStatCardComponent',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<UiStatCardComponent>;

export const Default: Story = {
  args: {
    label: 'Total Sales',
    value: '1,234',
    icon: 'dollar-sign',
  },
  render: (args) => ({
    props: args,
    template: `<ui-stat-card [label]="label" [value]="value" [icon]="icon"></ui-stat-card>`,
  }),
};

export const WithTrendUp: Story = {
  args: {
    label: 'Revenue',
    value: '$45,678',
    icon: 'trending-up',
    trend: 12.5,
  },
  render: (args) => ({
    props: args,
    template: `<ui-stat-card [label]="label" [value]="value" [icon]="icon" [trend]="trend"></ui-stat-card>`,
  }),
};

export const WithTrendDown: Story = {
  args: {
    label: 'Expenses',
    value: '$12,345',
    icon: 'trending-down',
    trend: -5.2,
  },
  render: (args) => ({
    props: args,
    template: `<ui-stat-card [label]="label" [value]="value" [icon]="icon" [trend]="trend"></ui-stat-card>`,
  }),
};

export const WithAccent: Story = {
  args: {
    label: 'Users',
    value: '892',
    icon: 'users',
    accent: true,
  },
  render: (args) => ({
    props: args,
    template: `<ui-stat-card [label]="label" [value]="value" [icon]="icon" [accent]="accent"></ui-stat-card>`,
  }),
};

export const FullFeatured: Story = {
  args: {
    label: 'Orders',
    value: '567',
    icon: 'shopping-cart',
    trend: 8.1,
    accent: true,
  },
  render: (args) => ({
    props: args,
    template: `<ui-stat-card [label]="label" [value]="value" [icon]="icon" [trend]="trend" [accent]="accent"></ui-stat-card>`,
  }),
};
