import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { ToastComponent, type JosanzToastItem } from './toast';

const meta: Meta<ToastComponent> = {
  component: ToastComponent,
  title: 'Josanz UI / Toast',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Cola de notificaciones con límite visible, acción opcional, dismiss manual y auto-dismiss configurable.',
        ),
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    toastDismiss: sbEmit('toastDismiss', 'Toast cerrado'),
    toastAction: sbEmit('toastAction', 'Acción pulsada'),
  },
};

export default meta;
type Story = StoryObj<ToastComponent>;

const toasts: JosanzToastItem[] = [
  {
    id: 'saved',
    title: 'Cambios guardados',
    description: 'La orden se sincronizó con el servidor.',
    tone: 'success',
    actionLabel: 'Ver orden',
  },
  {
    id: 'warning',
    title: 'Stock bajo',
    description: 'Quedan 2 unidades de pastillas de freno.',
    tone: 'warning',
  },
  {
    id: 'error',
    title: 'Error de envío',
    description: 'No se pudo notificar al cliente.',
    tone: 'danger',
    persistent: true,
  },
];

export const Playground: Story = {
  args: {
    toasts,
    position: 'top-right',
    dismissible: true,
    limit: 3,
    autoDismiss: false,
    toastDismiss: fn(),
    toastAction: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Ver orden/i }));
    await expect(args['toastAction']).toHaveBeenCalled();
  },
};

export const AutoDismissQueue: Story = {
  args: {
    toasts,
    position: 'bottom-right',
    autoDismiss: true,
    defaultDurationMs: 3000,
    toastDismiss: fn(),
  },
};
