import type { Meta, StoryObj } from '@storybook/angular';
import { bindStoryProps } from '../../../.storybook/bind-story-props';
import { sbSelect, sbHideData } from '../../../.storybook/story-arg-types';
import { NavMenuComponent } from './nav-menu.component';

const meta: Meta<NavMenuComponent> = {
  component: NavMenuComponent,
  title: 'NavMenuComponent',
  tags: ['autodocs'],
  argTypes: {
    variant: sbSelect(
      ['default', 'dark', 'light', 'primary', 'ghost', 'bordered', 'compact'] as const,
      'Variante',
    ),
    items: sbHideData,
  },
};
export default meta;
type Story = StoryObj<NavMenuComponent>;

const sampleItems = [
  { id: 'home', label: 'Home', icon: 'home', route: '/' },
  {
    id: 'products',
    label: 'Products',
    icon: 'package',
    route: '/products',
    badge: '12',
  },
  { id: 'users', label: 'Users', icon: 'users', route: '/users' },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings',
    route: '/settings',
    children: [
      {
        id: 'profile',
        label: 'Profile',
        icon: 'user',
        route: '/settings/profile',
      },
      {
        id: 'security',
        label: 'Security',
        icon: 'shield',
        route: '/settings/security',
      },
    ],
  },
];

export const Default: Story = {
  args: {
    items: sampleItems,
  },
  render: (args) => ({
    props: bindStoryProps(args),
    template: `
      <div style="max-width: 280px; padding: 12px; border-radius: var(--radius-md, 12px); border: 1px solid var(--border-soft); background: var(--surface);">
        <ui-nav-menu [items]="items" (itemClick)="onItemClick($event)"></ui-nav-menu>
      </div>
    `,
  }),
};

export const PrimaryVariant: Story = {
  args: {
    items: sampleItems,
    variant: 'primary',
  },
  render: (args) => ({
    props: bindStoryProps(args),
    template: `
      <div style="max-width: 280px; padding: 12px; border-radius: var(--radius-md, 12px); border: 1px solid var(--border-soft); background: var(--surface);">
        <ui-nav-menu [items]="items" [variant]="variant" (itemClick)="onItemClick($event)"></ui-nav-menu>
      </div>
    `,
  }),
};

export const BorderedVariant: Story = {
  args: {
    items: sampleItems,
    variant: 'bordered',
  },
  render: (args) => ({
    props: bindStoryProps(args),
    template: `
      <div style="max-width: 280px; padding: 12px; border-radius: var(--radius-md, 12px); border: 1px solid var(--border-soft); background: var(--surface);">
        <ui-nav-menu [items]="items" [variant]="variant" (itemClick)="onItemClick($event)"></ui-nav-menu>
      </div>
    `,
  }),
};

export const CompactVariant: Story = {
  args: {
    items: sampleItems,
    variant: 'compact',
  },
  render: (args) => ({
    props: bindStoryProps(args),
    template: `
      <div style="max-width: 280px; padding: 12px; border-radius: var(--radius-md, 12px); border: 1px solid var(--border-soft); background: var(--surface);">
        <ui-nav-menu [items]="items" [variant]="variant" (itemClick)="onItemClick($event)"></ui-nav-menu>
      </div>
    `,
  }),
};
