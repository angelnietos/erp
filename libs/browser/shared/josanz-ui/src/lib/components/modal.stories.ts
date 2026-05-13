import type { Meta, StoryObj } from '@storybook/angular';
import { ModalComponent } from './modal';
import { expect } from 'storybook/test';

const meta: Meta<ModalComponent> = {
  component: ModalComponent,
  title: 'ModalComponent',
};
export default meta;

type Story = StoryObj<ModalComponent>;

export const Primary: Story = {
  args: {
    title: '',
    width: '712px',
  },
};

export const Heading: Story = {
  args: {
    title: '',
    width: '712px',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/modal/gi)).toBeTruthy();
  },
};
