import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { ConfirmDialogComponent } from './confirm-dialog';

const meta: Meta<ConfirmDialogComponent> = {
  component: ConfirmDialogComponent,
  title: 'Josanz UI / Confirm Dialog',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Diálogo de confirmación para acciones destructivas o irreversibles.',
        ),
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    open: { control: 'boolean' },
    openChange: sbEmit('openChange', 'Cambio open'),
    confirmed: sbEmit('confirmed', 'Confirmado'),
    cancelled: sbEmit('cancelled', 'Cancelado'),
  },
};

export default meta;
type Story = StoryObj<ConfirmDialogComponent>;

export const DeleteRecord: Story = {
  args: {
    open: true,
    title: '¿Eliminar cliente?',
    message: 'Se borrarán contactos, historial y documentos asociados.',
    confirmLabel: 'Eliminar',
    cancelLabel: 'Mantener',
    confirmed: fn(),
    cancelled: fn(),
    openChange: fn(),
  },
};

export const InteractiveConfirm: Story = {
  args: {
    open: true,
    title: '¿Archivar orden?',
    message: 'Podrás restaurarla desde el histórico en 30 días.',
    confirmLabel: 'Archivar',
    confirmColor: 'var(--josanz-primary)',
    confirmed: fn(),
    cancelled: fn(),
    openChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Archivar/i }));
    await expect(args.confirmed).toHaveBeenCalledTimes(1);
    await expect(args.openChange).toHaveBeenCalledWith(false);
  },
};
