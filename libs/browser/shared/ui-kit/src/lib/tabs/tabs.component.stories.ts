import type { Meta, StoryObj } from '@storybook/angular';
import { UiTabsComponent } from './tabs.component';

const meta: Meta<UiTabsComponent> = {
  component: UiTabsComponent,
  title: 'UiTabsComponent',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<UiTabsComponent>;

const sampleTabs = [
  { id: 'tab1', label: 'Tab 1' },
  { id: 'tab2', label: 'Tab 2', badge: 3 },
  { id: 'tab3', label: 'Tab 3' },
];

export const Default: Story = {
  args: {
    tabs: sampleTabs,
    activeTab: 'tab1',
  },
  render: (args) => ({
    props: args,
    template: `<ui-tabs [tabs]="tabs" [activeTab]="activeTab" (tabChange)="onTabChange($event)"></ui-tabs>`,
  }),
};

export const WithIcons: Story = {
  args: {
    tabs: [
      { id: 'home', label: 'Home', icon: 'home' },
      { id: 'settings', label: 'Settings', icon: 'settings' },
      { id: 'profile', label: 'Profile', icon: 'user' },
    ],
    activeTab: 'home',
  },
  render: (args) => ({
    props: args,
    template: `<ui-tabs [tabs]="tabs" [activeTab]="activeTab" (tabChange)="onTabChange($event)"></ui-tabs>`,
  }),
};

export const UnderlineVariant: Story = {
  args: {
    tabs: sampleTabs,
    activeTab: 'tab1',
    variant: 'underline',
  },
  render: (args) => ({
    props: args,
    template: `<ui-tabs [tabs]="tabs" [activeTab]="activeTab" [variant]="variant" (tabChange)="onTabChange($event)"></ui-tabs>`,
  }),
};

export const PillsVariant: Story = {
  args: {
    tabs: sampleTabs,
    activeTab: 'tab1',
    variant: 'pills',
  },
  render: (args) => ({
    props: args,
    template: `<ui-tabs [tabs]="tabs" [activeTab]="activeTab" [variant]="variant" (tabChange)="onTabChange($event)"></ui-tabs>`,
  }),
};

export const BoxedVariant: Story = {
  args: {
    tabs: sampleTabs,
    activeTab: 'tab1',
    variant: 'boxed',
  },
  render: (args) => ({
    props: args,
    template: `<ui-tabs [tabs]="tabs" [activeTab]="activeTab" [variant]="variant" (tabChange)="onTabChange($event)"></ui-tabs>`,
  }),
};

export const IconVariant: Story = {
  args: {
    tabs: [
      { id: 'home', label: 'Home', icon: 'home' },
      { id: 'search', label: 'Search', icon: 'search' },
      { id: 'user', label: 'User', icon: 'user' },
    ],
    activeTab: 'home',
    variant: 'icon',
  },
  render: (args) => ({
    props: args,
    template: `<ui-tabs [tabs]="tabs" [activeTab]="activeTab" [variant]="variant" (tabChange)="onTabChange($event)"></ui-tabs>`,
  }),
};
