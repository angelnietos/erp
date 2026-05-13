import type { Meta, StoryObj } from '@storybook/angular';
import { InputComponent } from './input';
import { expect } from 'storybook/test';

const meta: Meta<InputComponent> = {
  component: InputComponent,
  title: 'InputComponent',
};
export default meta;

type Story = StoryObj<InputComponent>;

export const Primary: Story = {
  args: {
    label: '',
    placeholder: '',
    type: 'text',
    controlName: '',
  },
};

export const Heading: Story = {
  args: {
    label: '',
    placeholder: '',
    type: 'text',
    controlName: '',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/input/gi)).toBeTruthy();
  },
};
