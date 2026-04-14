import type { Meta, StoryObj } from '@storybook/angular';
import { sbSelect } from '../../../.storybook/story-arg-types';
import { UiAlertComponent } from './alert.component';

const meta: Meta<UiAlertComponent> = {
  component: UiAlertComponent,
  title: 'UiAlertComponent',
  tags: ['autodocs'],
  argTypes: {
    variant: sbSelect(
      [
        'error',
        'success',
        'warning',
        'info',
        'primary',
        'secondary',
        'dark',
        'light',
        'ghost',
        'outline',
        'theme',
        'purple',
        'indigo',
        'teal',
        'orange',
        'pink',
        'rose',
        'violet',
        'fuchsia',
        'app',
      ] as const,
      'Variante',
    ),
  },
};
export default meta;
type Story = StoryObj<UiAlertComponent>;

export const Error: Story = {
  args: {
    variant: 'error',
  },
  render: (args) => ({
    props: args,
    template: `<ui-alert [variant]="variant">Este es un mensaje de error.</ui-alert>`,
  }),
};

export const Success: Story = {
  args: {
    variant: 'success',
  },
  render: (args) => ({
    props: args,
    template: `<ui-alert [variant]="variant">Acción completada con éxito.</ui-alert>`,
  }),
};
