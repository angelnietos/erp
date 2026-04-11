import type { Meta, StoryObj } from '@storybook/angular';
import { UiLoaderComponent } from './loader.component';

const meta: Meta<UiLoaderComponent> = {
  component: UiLoaderComponent,
  title: 'UiLoaderComponent',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<UiLoaderComponent>;

export const Default: Story = {
  args: {},
  render: (args) => ({
    props: args,
    template: `<ui-loader></ui-loader>`,
  }),
};

export const WithMessage: Story = {
  args: {
    message: 'Loading...',
  },
  render: (args) => ({
    props: args,
    template: `<ui-loader [message]="message"></ui-loader>`,
  }),
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    message: 'Processing',
  },
  render: (args) => ({
    props: args,
    template: `<ui-loader [variant]="variant" [message]="message"></ui-loader>`,
  }),
};

export const Success: Story = {
  args: {
    variant: 'success',
    message: 'Success!',
  },
  render: (args) => ({
    props: args,
    template: `<ui-loader [variant]="variant" [message]="message"></ui-loader>`,
  }),
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    message: 'Error',
  },
  render: (args) => ({
    props: args,
    template: `<ui-loader [variant]="variant" [message]="message"></ui-loader>`,
  }),
};

export const Overlay: Story = {
  args: {
    overlay: true,
    message: 'Full screen loading',
  },
  render: (args) => ({
    props: args,
    template: `<ui-loader [overlay]="overlay" [message]="message"></ui-loader>`,
  }),
};
