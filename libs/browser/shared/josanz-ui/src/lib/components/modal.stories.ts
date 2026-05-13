import type { Meta, StoryObj } from '@storybook/angular';
import { ModalComponent } from './modal';
import { expect, within } from '@storybook/test';

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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/modal/gi)).toBeTruthy();
  },
};
