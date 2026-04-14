import type { Meta, StoryObj } from '@storybook/angular';
import { UiButtonComponent } from './button.component';

const meta: Meta<UiButtonComponent> = {
  component: UiButtonComponent,
  title: 'UiButtonComponent',
  tags: ['autodocs'],
  argTypes: {
    type: {
      options: ['button', 'submit'],
      control: { type: 'select' },
    },
  },
};
export default meta;
type Story = StoryObj<UiButtonComponent>;

const baseArgs = {
  type: 'button' as const,
  disabled: false,
  loading: false,
  icon: 'arrow-right',
  color: 'primary' as const,
  shape: 'solid' as const,
  size: 'md' as const,
};

export const Primary: Story = {
  args: { ...baseArgs },
  render: (args) => ({
    props: args,
    template: `
      <ui-button
        [type]="type"
        [disabled]="disabled"
        [loading]="loading"
        [icon]="icon"
        [color]="color"
        [shape]="shape"
        [size]="size"
      >Primary</ui-button>
    `,
  }),
};

export const Loading: Story = {
  args: {
    ...baseArgs,
    loading: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-button
        [type]="type"
        [disabled]="disabled"
        [loading]="loading"
        [icon]="icon"
        [color]="color"
        [shape]="shape"
        [size]="size"
      >Loading</ui-button>
    `,
  }),
};

export const Disabled: Story = {
  args: {
    ...baseArgs,
    disabled: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-button
        [type]="type"
        [disabled]="disabled"
        [loading]="loading"
        [icon]="icon"
        [color]="color"
        [shape]="shape"
        [size]="size"
      >Disabled</ui-button>
    `,
  }),
};
