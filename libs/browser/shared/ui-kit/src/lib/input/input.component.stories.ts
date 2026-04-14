import type { Meta, StoryObj } from '@storybook/angular';
import { sbSelect } from '../../../.storybook/story-arg-types';
import { UiInputComponent } from './input.component';

const meta: Meta<UiInputComponent> = {
  component: UiInputComponent,
  title: 'UiInputComponent',
  tags: ['autodocs'],
  argTypes: {
    color: sbSelect(
      ['default', 'primary', 'danger', 'success', 'warning', 'info'] as const,
      'Color',
    ),
    shape: sbSelect(
      ['auto', 'solid', 'glass', 'outline', 'flat', 'neumorphic', 'underline', 'minimal', 'rounded'] as const,
      'Forma',
    ),
    size: sbSelect(['sm', 'md'] as const, 'Tamaño'),
    type: sbSelect(['text', 'email', 'password', 'number', 'search', 'tel', 'url'] as const, 'Tipo input'),
    error: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<UiInputComponent>;

export const Default: Story = {
  args: {
    id: 'email',
    label: 'E-mail',
    placeholder: 'Introduce tu e-mail',
    type: 'email',
    icon: 'user',
    error: false,
  },
};

export const Error: Story = {
  args: {
    ...Default.args,
    error: true,
  },
};

export const Password: Story = {
  args: {
    ...Default.args,
    label: 'Contraseña',
    type: 'password',
    icon: undefined,
  },
};
