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
    label: 'Añadir',
    showIcon: true,
    disabled: false,
    size: 'md',
    variant: 'primary',
    fullWidth: false,
  },
};

export const Heading: Story = {
  args: {
    label: 'Añadir',
    showIcon: true,
    disabled: false,
    size: 'md',
    variant: 'primary',
    fullWidth: false,
  },
  
};
