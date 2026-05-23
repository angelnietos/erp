import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import {
  sbEmit,
  josanzStoryThemeDescription,
} from '../../../.storybook/story-arg-types';
import { BottomSheetComponent } from './bottom-sheet';
import { ButtonComponent } from './button';
import { ListItemComponent } from './list-item';

const meta: Meta<BottomSheetComponent> = {
  component: BottomSheetComponent,
  title: 'Josanz UI / Bottom Sheet',
  decorators: [
    moduleMetadata({
      imports: [BottomSheetComponent, ButtonComponent, ListItemComponent],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Panel inferior para acciones rápidas en móvil. API `open` / `openChange`, backdrop y Escape.',
        ),
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    open: { control: 'boolean' },
    openChange: sbEmit('openChange', 'Cambio open'),
    closed: sbEmit('closed', 'Cerrado'),
  },
};

export default meta;
type Story = StoryObj<BottomSheetComponent>;

export const Playground: Story = {
  args: {
    open: true,
    title: 'Acciones del vehículo',
    description: 'Elige una operación rápida.',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="mx-auto min-h-[720px] max-w-[390px] overflow-hidden rounded-[32px] border border-solid p-6" style="background: var(--josanz-bg); border-color: var(--josanz-border);">
        <div class="grid gap-4 pb-32">
          <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Vehículo VH-204</p>
          <h1 class="m-0 text-2xl font-black" style="color: var(--josanz-text);">Incidencia en ruta</h1>
          <div class="rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
            <p class="m-0 text-sm" style="color: var(--josanz-text-muted);">Estado</p>
            <strong style="color: var(--josanz-text);">Pendiente asignar técnico</strong>
          </div>
        </div>
        <josanz-bottom-sheet
          [open]="open"
          [title]="title"
          [description]="description"
        >
          <div class="grid gap-2">
            <josanz-list-item title="Asignar técnico" subtitle="Taller principal · disponible ahora"></josanz-list-item>
            <josanz-list-item title="Registrar entrada" subtitle="Hoy 09:30 · muelle 2"></josanz-list-item>
            <josanz-list-item title="Enviar presupuesto" subtitle="Pendiente firma del cliente"></josanz-list-item>
            <div class="pt-2">
              <josanz-button label="Abrir parte completo" [showIcon]="false" [fullWidth]="true"></josanz-button>
            </div>
          </div>
        </josanz-bottom-sheet>
      </div>
    `,
  }),
};

export const InteractiveClose: Story = {
  args: {
    open: true,
    title: 'Confirmar salida',
    openChange: fn(),
    closed: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="mx-auto min-h-[520px] max-w-[390px] rounded-[32px] border border-solid p-6" style="background: var(--josanz-bg); border-color: var(--josanz-border);">
        <p class="m-0 text-sm" style="color: var(--josanz-text-muted);">Shell móvil de confirmación rápida.</p>
        <josanz-bottom-sheet
          [open]="open"
          [title]="title"
          (openChange)="openChange($event)"
          (closed)="closed()"
        >
          <p style="color: var(--josanz-text-muted);">Pulsa backdrop o × para cerrar sin perder el borrador.</p>
        </josanz-bottom-sheet>
      </div>
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: /cerrar bottom sheet/i }),
    );
    await expect(args.openChange).toHaveBeenCalledWith(false);
    await expect(args.closed).toHaveBeenCalledTimes(1);
  },
};

export const InvoiceQuickActions: Story = {
  args: {
    open: true,
    title: 'Factura INV-2026-004',
    description: 'Acciones rápidas para contabilidad desde móvil.',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="mx-auto min-h-[720px] max-w-[390px] overflow-hidden rounded-[32px] border border-solid p-6" style="background: var(--josanz-bg); border-color: var(--josanz-border);">
        <div class="rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">NovaByte</p>
          <h2 class="m-0 mt-1 text-2xl font-black" style="color: var(--josanz-text);">1.250 EUR</h2>
          <p class="m-0 mt-2 text-sm" style="color: var(--josanz-text-muted);">Vence en 12 días · pendiente de cobro</p>
        </div>
        <josanz-bottom-sheet [open]="open" [title]="title" [description]="description">
          <div class="grid gap-2">
            <josanz-list-item title="Enviar recordatorio" subtitle="Email + SMS al contacto fiscal"></josanz-list-item>
            <josanz-list-item title="Marcar como cobrada" subtitle="Registrar fecha y forma de pago"></josanz-list-item>
            <josanz-list-item title="Descargar PDF" subtitle="Documento listo para archivo"></josanz-list-item>
          </div>
        </josanz-bottom-sheet>
      </div>
    `,
  }),
};
