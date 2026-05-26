import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { ContextMenuComponent } from './context-menu';

const meta: Meta<ContextMenuComponent> = {
  component: ContextMenuComponent,
  title: 'Josanz UI / Context Menu',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription('Menú contextual con atajos, divisores y acciones destructivas.'),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    buttonText: { control: 'text', description: 'Texto visible del trigger' },
    buttonLabel: { control: 'text', description: 'Etiqueta accesible del trigger' },
    items: { control: 'object', description: 'Elementos del menú, atajos, divisores y tono danger' },
    open: { control: 'boolean', description: 'Estado abierto controlado' },
    closeOnOutsideClick: { control: 'boolean', description: 'Cierra al hacer click fuera del host' },
    openChange: sbEmit('openChange', 'Cambio de apertura'),
    itemSelect: sbEmit('itemSelect', 'Selección de ítem'),
  },
};

export default meta;
type Story = StoryObj<ContextMenuComponent>;

const items = [
  { id: 'open', label: 'Abrir detalle', shortcut: '↵' },
  { id: 'assign', label: 'Asignar técnico', shortcut: 'A' },
  { id: 'archive', label: 'Archivar', dividerBefore: true },
  { id: 'delete', label: 'Eliminar', tone: 'danger' as const },
];

export const Playground: Story = {
  args: {
    buttonText: 'Acciones',
    items,
    open: false,
    itemSelect: fn(),
    openChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Acciones/i }));
    await expect(args['openChange']).toHaveBeenCalledWith(true);
    await userEvent.click(canvas.getByRole('menuitem', { name: /Asignar/i }));
    await expect(args['itemSelect']).toHaveBeenCalled();
  },
};

export const RowActionsUseCase: Story = {
  args: {
    buttonText: '•••',
    buttonLabel: 'Abrir acciones de la orden #1042',
    items,
    itemSelect: fn(),
    openChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <section class="w-[680px] rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <div class="mb-4">
          <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Órdenes activas</p>
          <h2 class="m-0 mt-1 text-xl font-black" style="color: var(--josanz-text);">Acciones por fila</h2>
        </div>
        <div class="flex items-center justify-between rounded-2xl border border-solid p-4" style="border-color: var(--josanz-border);">
          <div>
            <strong style="color: var(--josanz-text);">#1042 · Ana Muñoz</strong>
            <p class="m-0 mt-1 text-sm" style="color: var(--josanz-text-muted);">En curso · Entrega viernes · 420 EUR</p>
          </div>
          <josanz-context-menu
            [buttonText]="buttonText"
            [buttonLabel]="buttonLabel"
            [items]="items"
            (openChange)="openChange($event)"
            (itemSelect)="itemSelect($event)"
          ></josanz-context-menu>
        </div>
      </section>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /acciones de la orden/i }));
    await userEvent.click(canvas.getByRole('menuitem', { name: /Abrir detalle/i }));
    await expect(args['itemSelect']).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'open' }),
    );
  },
};

export const DangerAndDisabledItems: Story = {
  args: {
    buttonText: 'Documento',
    open: true,
    items: [
      { id: 'download', label: 'Descargar PDF', shortcut: 'D' },
      { id: 'signed', label: 'Marcar como firmado', disabled: true },
      { id: 'delete', label: 'Eliminar documento', dividerBefore: true, tone: 'danger' },
    ],
  },
};
