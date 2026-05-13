import type { Meta, StoryObj } from '@storybook/angular';
import { ModalComponent } from './modal';
import { expect, within } from '@storybook/test';

const meta: Meta<ModalComponent> = {
  component: ModalComponent,
  title: 'ModalComponent',
  tags: ['autodocs'],
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
  
};
