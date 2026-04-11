import type { Meta, StoryObj } from '@storybook/angular';
import { UiInputComponent } from './input.component';
import { User } from 'lucide-angular';

const meta: Meta<UiInputComponent> = {
  component: UiInputComponent,
  title: 'UiInputComponent',
  tags: ['autodocs'],
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
