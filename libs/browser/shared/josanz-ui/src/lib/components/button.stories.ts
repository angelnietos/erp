import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button';
import { expect, within } from '@storybook/test';

const meta: Meta<ButtonComponent> = {
  component: ButtonComponent,
  title: 'ButtonComponent',
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/button/gi)).toBeTruthy();
  },
};
