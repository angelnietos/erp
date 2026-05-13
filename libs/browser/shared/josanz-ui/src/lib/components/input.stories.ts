import type { Meta, StoryObj } from '@storybook/angular';
import { InputComponent } from './input';
import { expect, within } from '@storybook/test';

const meta: Meta<InputComponent> = {
  component: InputComponent,
  title: 'InputComponent',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<InputComponent>;

export const Text: Story = {
  args: {
    label: 'Nombre',
    placeholder: 'Introduce tu nombre',
    type: 'text',
    controlName: 'name',
  },
};

export const Email: Story = {
  args: {
    label: 'Correo Electrónico',
    placeholder: 'ejemplo@correo.com',
    type: 'email',
    controlName: 'email',
  },
};

export const Password: Story = {
  args: {
    label: 'Contraseña',
    placeholder: '••••••••',
    type: 'password',
    controlName: 'password',
  },
};

export const Number: Story = {
  args: {
    label: 'Edad',
    placeholder: 'Introduce tu edad',
    type: 'number',
    controlName: 'age',
  },
};
