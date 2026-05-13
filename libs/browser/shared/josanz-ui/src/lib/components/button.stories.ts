import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button';
import { expect, within } from '@storybook/test';

const meta: Meta<ButtonComponent> = {
  component: ButtonComponent,
  title: 'ButtonComponent',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {
  args: {
    label: 'Primary Button',
    showIcon: true,
    disabled: false,
    size: 'md',
    variant: 'primary',
    fullWidth: false,
  },
};

export const Secondary: Story = {
  args: {
    label: 'Secondary Button',
    showIcon: true,
    disabled: false,
    size: 'md',
    variant: 'secondary',
    fullWidth: false,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Button',
    showIcon: true,
    disabled: true,
    size: 'md',
    variant: 'primary',
    fullWidth: false,
  },
};

export const Small: Story = {
  args: {
    label: 'Small Button',
    showIcon: true,
    disabled: false,
    size: 'sm',
    variant: 'primary',
    fullWidth: false,
  },
};

export const Large: Story = {
  args: {
    label: 'Large Button',
    showIcon: true,
    disabled: false,
    size: 'lg',
    variant: 'primary',
    fullWidth: false,
  },
};

export const FullWidth: Story = {
  args: {
    label: 'Full Width Button',
    showIcon: true,
    disabled: false,
    size: 'md',
    variant: 'primary',
    fullWidth: true,
  },
};
