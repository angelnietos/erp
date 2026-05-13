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

export const Default: Story = {
  args: {
    title: 'Crear Cliente',
    width: '712px',
  },
};

export const Small: Story = {
  args: {
    title: 'Confirmar Eliminación',
    width: '400px',
  },
};

export const Large: Story = {
  args: {
    title: 'Detalles del Presupuesto',
    width: '900px',
  },
};
