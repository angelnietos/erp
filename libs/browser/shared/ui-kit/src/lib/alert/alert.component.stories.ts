import type { Meta, StoryObj } from '@storybook/angular';
import { sbSelect } from '../../../.storybook/story-arg-types';
import { UiAlertComponent } from './alert.component';

const meta: Meta<UiAlertComponent> = {
  component: UiAlertComponent,
  title: 'UI Kit / Alert',
  tags: ['autodocs'],
  argTypes: {
    variant: sbSelect(
      [
        'error', 'success', 'warning', 'info', 'primary', 'secondary', 'dark', 'light',
        'ghost', 'outline', 'theme', 'purple', 'indigo', 'teal', 'orange', 'pink', 'rose',
        'violet', 'fuchsia', 'app',
      ] as const,
      'Variante',
    ),
  },
};

export default meta;
type Story = StoryObj<UiAlertComponent>;

/**
 * Un solo lienzo con `[variant]`: el control y Autodocs reflejan la API real.
 */
export const Playground: Story = {
  args: {
    variant: 'info' as const,
  },
  render: (args) => ({
    props: args,
    template: `<ui-alert [variant]="variant">Mensaje de alerta. Cambia <code>variant</code> en los controles.</ui-alert>`,
  }),
};

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
