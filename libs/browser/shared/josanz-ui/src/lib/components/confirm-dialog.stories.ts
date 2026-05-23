import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import {
  josanzStoryThemeDescription,
  sbEmit,
  sbShapeArgTypes,
} from '../../../.storybook/story-arg-types';
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
    title: { control: 'text' },
    message: { control: 'text' },
    confirmLabel: { control: 'text' },
    cancelLabel: { control: 'text' },
    confirmColor: { control: 'color' },
    closeOnBackdrop: { control: 'boolean' },
    closeOnEscape: { control: 'boolean' },
    ...sbShapeArgTypes,
    openChange: sbEmit('openChange', 'Cambio open'),
    confirmed: sbEmit('confirmed', 'Confirmado'),
    cancelled: sbEmit('cancelled', 'Cancelado'),
  },
};

export default meta;
type Story = StoryObj<ConfirmDialogComponent>;

export const Playground: Story = {
  args: {
    open: true,
    title: 'Confirmar cambios',
    message: 'Se guardaran los datos del cliente y se notificara al equipo.',
    confirmLabel: 'Guardar',
    cancelLabel: 'Cancelar',
    confirmColor: 'var(--josanz-primary)',
    closeOnBackdrop: true,
    closeOnEscape: true,
    shape: 'rounded',
    confirmed: fn(),
    cancelled: fn(),
    openChange: fn(),
  },
};

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

export const StatesAndVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="min-h-[460px] p-6" style="background: var(--josanz-bg);">
        <josanz-confirm-dialog
          [open]="true"
          title="Eliminar cliente"
          message="Esta vista muestra el estado destructivo con color danger."
          confirmLabel="Eliminar"
          cancelLabel="Mantener"
          confirmColor="var(--josanz-danger)"
        ></josanz-confirm-dialog>
      </div>
    `,
  }),
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

export const InteractiveCancel: Story = {
  args: {
    open: true,
    title: 'Descartar cambios',
    message: 'Perderas la informacion no guardada.',
    confirmLabel: 'Descartar',
    cancelLabel: 'Volver',
    cancelled: fn(),
    openChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /volver/i }));
    await expect(args.cancelled).toHaveBeenCalledTimes(1);
    await expect(args.openChange).toHaveBeenCalledWith(false);
  },
};
