import type { Meta, StoryObj } from '@storybook/angular';
import { UiBadgeComponent } from './badge.component';

const meta: Meta<UiBadgeComponent> = {
  component: UiBadgeComponent,
  title: 'UiBadgeComponent',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<UiBadgeComponent>;

export const Default: Story = {
  args: {
    color: 'default',
  },
  render: (args) => ({
    props: args,
    template: `<ui-badge [color]="color">Default</ui-badge>`,
  }),
};

export const Primary: Story = {
  args: {
    color: 'primary',
  },
  render: (args) => ({
    props: args,
    template: `<ui-badge [color]="color">Primary</ui-badge>`,
  }),
};

export const Success: Story = {
  args: {
    color: 'success',
  },
  render: (args) => ({
    props: args,
    template: `<ui-badge [color]="color">Success</ui-badge>`,
  }),
};

export const Warning: Story = {
  args: {
    color: 'warning',
  },
  render: (args) => ({
    props: args,
    template: `<ui-badge [color]="color">Warning</ui-badge>`,
  }),
};

export const Danger: Story = {
  args: {
    color: 'danger',
  },
  render: (args) => ({
    props: args,
    template: `<ui-badge [color]="color">Danger</ui-badge>`,
  }),
};

export const Info: Story = {
  args: {
    color: 'info',
  },
  render: (args) => ({
    props: args,
    template: `<ui-badge [color]="color">Info</ui-badge>`,
  }),
};

export const SolidShape: Story = {
  args: {
    color: 'primary',
    shape: 'solid',
  },
  render: (args) => ({
    props: args,
    template: `<ui-badge [color]="color" [shape]="shape">Solid</ui-badge>`,
  }),
};

export const OutlineShape: Story = {
  args: {
    color: 'primary',
    shape: 'outline',
  },
  render: (args) => ({
    props: args,
    template: `<ui-badge [color]="color" [shape]="shape">Outline</ui-badge>`,
  }),
};

export const GlassShape: Story = {
  args: {
    color: 'primary',
    shape: 'glass',
  },
  render: (args) => ({
    props: args,
    template: `<ui-badge [color]="color" [shape]="shape">Glass</ui-badge>`,
  }),
};

export const GhostShape: Story = {
  args: {
    color: 'primary',
    shape: 'ghost',
  },
  render: (args) => ({
    props: args,
    template: `<ui-badge [color]="color" [shape]="shape">Ghost</ui-badge>`,
  }),
};
